'use server'

import { createClient } from '@/lib/supabase/server'
import { runMLBridge } from '@/lib/actions/ml/bridge'
import { analyzeHealthWithGemini } from './healthAssessment'
import { explainMLWithGemini } from './explainResults'
import { HealthInput } from './types'
import { generateGroqDetailedAnalysis } from './groqAnalysis'

type SupportedRiskLevel = 'LOW' | 'MODERATE' | 'HIGH'

function isProbablyEnglishText(text: string): boolean {
    if (!text) return true
    const sample = text.slice(0, 500)
    const letters = sample.match(/[A-Za-z]/g)?.length || 0
    const nonAscii = sample.match(/[^\x00-\x7F]/g)?.length || 0
    return letters > 40 && nonAscii < 8
}

type AppLanguage =
    | 'English'
    | 'Hindi'
    | 'Marathi'
    | 'Gujarati'
    | 'Tamil'
    | 'Telugu'
    | 'Kannada'
    | 'Malayalam'
    | 'Bengali'
    | 'Punjabi'
    | 'Assamese'
    | 'Odia'
    | 'Urdu'
    | 'Kashmiri'

type LanguagePack = {
    diseases: { heart: string; hyper: string; diabetes: string }
    risk: { low: string; moderate: string; high: string }
    lead: string
    basedOn: string
    guidance: string
    reason: string
    urgent: string
    precautions: {
        heart: string[]
        hyper: string[]
        diabetes: string[]
    }
}

const LANGUAGE_PACKS: Partial<Record<AppLanguage, LanguagePack>> = {
    Hindi: {
        diseases: { heart: 'हृदय रोग', hyper: 'उच्च रक्तचाप', diabetes: 'मधुमेह' },
        risk: { low: 'कम जोखिम', moderate: 'मध्यम जोखिम', high: 'उच्च जोखिम' },
        lead: 'मुख्य योगदान कारक',
        basedOn: 'उपलब्ध क्लिनिकल संकेतकों के आधार पर यह आकलन तैयार किया गया है।',
        guidance: 'कृपया आहार, व्यायाम और नियमित जांच पर ध्यान दें।',
        reason: 'आपके जोखिम को प्रभावित कर रहा है।',
        urgent: 'जोखिम उच्च है; जल्द से जल्द चिकित्सक से परामर्श लें।',
        precautions: {
            heart: ['नमक और ट्रांस-फैट कम करें।', 'हर सप्ताह कम से कम 150 मिनट व्यायाम करें।', 'रक्तचाप और लिपिड प्रोफाइल की नियमित जांच कराएं।'],
            hyper: ['दैनिक नमक सेवन कम रखें।', 'रोजाना रक्तचाप मॉनिटर करें।', 'तनाव कम करने के लिए नींद और ध्यान अपनाएं।'],
            diabetes: ['मीठे पेय और जंक फूड कम करें।', 'फास्टिंग ग्लूकोज़ और HbA1c नियमित जांचें।', 'वजन नियंत्रण और सक्रिय दिनचर्या बनाए रखें।'],
        },
    },
    Marathi: {
        diseases: { heart: 'हृदयरोग', hyper: 'उच्च रक्तदाब', diabetes: 'मधुमेह' },
        risk: { low: 'कमी धोका', moderate: 'मध्यम धोका', high: 'उच्च धोका' },
        lead: 'मुख्य कारणीभूत घटक',
        basedOn: 'उपलब्ध क्लिनिकल निर्देशकांवर आधारित हे मूल्यांकन केले आहे.',
        guidance: 'कृपया आहार, व्यायाम आणि नियमित तपासणीकडे लक्ष द्या.',
        reason: 'आपल्या धोक्यावर परिणाम करत आहे.',
        urgent: 'धोका उच्च आहे; लवकरात लवकर डॉक्टरांचा सल्ला घ्या.',
        precautions: {
            heart: ['मीठ आणि ट्रान्स-फॅट कमी करा.', 'आठवड्याला किमान 150 मिनिटे व्यायाम करा.', 'रक्तदाब आणि लिपिड प्रोफाइल तपासा.'],
            hyper: ['दररोज मीठाचे प्रमाण कमी ठेवा.', 'रोज रक्तदाब नोंदवा.', 'ताण कमी करण्यासाठी झोप आणि ध्यान ठेवा.'],
            diabetes: ['साखरयुक्त पेये आणि जंक फूड कमी करा.', 'फास्टिंग ग्लुकोज आणि HbA1c तपासा.', 'वजन नियंत्रण आणि सक्रिय दिनचर्या ठेवा.'],
        },
    },
    Gujarati: {
        diseases: { heart: 'હૃદય રોગ', hyper: 'ઉચ્ચ રક્તચાપ', diabetes: 'ડાયાબિટીસ' },
        risk: { low: 'ઓછું જોખમ', moderate: 'મધ્યમ જોખમ', high: 'ઉચ્ચ જોખમ' },
        lead: 'મુખ્ય જોખમ પરિબળો',
        basedOn: 'ઉપલબ્ધ ક્લિનિકલ સૂચકોના આધાર પર આ મૂલ્યાંકન બનાવાયું છે.',
        guidance: 'કૃપા કરીને આહાર, વ્યાયામ અને નિયમિત તપાસ પર ધ્યાન આપો.',
        reason: 'તમારા જોખમને અસર કરી રહ્યું છે.',
        urgent: 'જોખમ ઊંચું છે; તાત્કાલિક ડૉક્ટરની સલાહ લો.',
        precautions: {
            heart: ['મીઠું અને ટ્રાન્સ-ફેટ ઓછું કરો.', 'અઠવાડિયામાં ઓછામાં ઓછા 150 મિનિટ વ્યાયામ કરો.', 'બ્લડ પ્રેશર અને લિપિડ પ્રોફાઇલ તપાસો.'],
            hyper: ['દૈનિક મીઠાનું પ્રમાણ ઓછું રાખો.', 'દરરોજ બ્લડ પ્રેશર મોનીટર કરો.', 'તાણ ઘટાડવા માટે સારી ઊંઘ અને ધ્યાન કરો.'],
            diabetes: ['મીઠી પીણાં અને જંક ફૂડ ઓછું કરો.', 'ફાસ્ટિંગ ગ્લૂકોઝ અને HbA1c તપાસો.', 'વજન નિયંત્રણ અને સક્રિય જીવનશૈલી રાખો.'],
        },
    },
    Tamil: {
        diseases: { heart: 'இதய நோய்', hyper: 'உயர் இரத்த அழுத்தம்', diabetes: 'நீரிழிவு' },
        risk: { low: 'குறைந்த ஆபத்து', moderate: 'மிதமான ஆபத்து', high: 'அதிக ஆபத்து' },
        lead: 'முக்கிய காரணிகள்',
        basedOn: 'கிடைக்கும் மருத்துவ குறிப்புகளின் அடிப்படையில் இந்த மதிப்பீடு செய்யப்பட்டது.',
        guidance: 'உணவு, உடற்பயிற்சி மற்றும் வழக்கமான பரிசோதனையை கவனிக்கவும்.',
        reason: 'உங்கள் ஆபத்தை பாதிக்கிறது.',
        urgent: 'ஆபத்து அதிகம்; உடனடியாக மருத்துவரை அணுகவும்.',
        precautions: {
            heart: ['உப்பு மற்றும் டிரான்ஸ் கொழுப்பு குறைக்கவும்.', 'வாரத்திற்கு குறைந்தது 150 நிமிடம் உடற்பயிற்சி செய்யவும்.', 'இரத்த அழுத்தம் மற்றும் லிபிட் சோதனை செய்யவும்.'],
            hyper: ['தினசரி உப்பை கட்டுப்படுத்தவும்.', 'ரத்த அழுத்தத்தை தொடர்ந்து கண்காணிக்கவும்.', 'மன அழுத்தத்தை குறைக்க தூக்கம் மற்றும் தியானம் செய்யவும்.'],
            diabetes: ['சர்க்கரை பானங்கள் மற்றும் ஜங்க் உணவை குறைக்கவும்.', 'விரத குளுக்கோஸ் மற்றும் HbA1c சோதிக்கவும்.', 'எடை கட்டுப்பாடு மற்றும் செயல்பாட்டு வாழ்க்கைமுறை பின்பற்றவும்.'],
        },
    },
    Telugu: {
        diseases: { heart: 'గుండె వ్యాధి', hyper: 'అధిక రక్తపోటు', diabetes: 'మధుమేహం' },
        risk: { low: 'తక్కువ ప్రమాదం', moderate: 'మధ్యస్థ ప్రమాదం', high: 'అధిక ప్రమాదం' },
        lead: 'ప్రధాన ప్రభావిత కారకాలు',
        basedOn: 'లభ్యమైన క్లినికల్ సూచకాల ఆధారంగా ఈ అంచనా రూపొందించబడింది.',
        guidance: 'ఆహారం, వ్యాయామం మరియు నియమిత పరీక్షలపై దృష్టి పెట్టండి.',
        reason: 'మీ ప్రమాదాన్ని ప్రభావితం చేస్తోంది.',
        urgent: 'ప్రమాదం అధికం; వెంటనే వైద్యుడిని సంప్రదించండి.',
        precautions: {
            heart: ['ఉప్పు మరియు ట్రాన్స్ ఫ్యాట్ తగ్గించండి.', 'వారానికి కనీసం 150 నిమిషాలు వ్యాయామం చేయండి.', 'బీపీ మరియు లిపిడ్ ప్రొఫైల్ పరీక్షించండి.'],
            hyper: ['రోజువారీ ఉప్పు వినియోగం తగ్గించండి.', 'ప్రతిరోజూ బీపీని మానిటర్ చేయండి.', 'స్ట్రెస్ తగ్గించడానికి నిద్ర మరియు ధ్యానం పాటించండి.'],
            diabetes: ['తీపి పానీయాలు మరియు జంక్ ఫుడ్ తగ్గించండి.', 'ఫాస్టింగ్ గ్లూకోజ్ మరియు HbA1c పరీక్షించండి.', 'బరువు నియంత్రణ మరియు చురుకైన జీవనశైలి పాటించండి.'],
        },
    },
    Kannada: {
        diseases: { heart: 'ಹೃದಯ ರೋಗ', hyper: 'ಉಚ್ಚ ರಕ್ತದೊತ್ತಡ', diabetes: 'ಮಧುಮೇಹ' },
        risk: { low: 'ಕಡಿಮೆ ಅಪಾಯ', moderate: 'ಮಧ್ಯಮ ಅಪಾಯ', high: 'ಹೆಚ್ಚಿನ ಅಪಾಯ' },
        lead: 'ಮುಖ್ಯ ಕಾರಣಕಾರಿ ಅಂಶಗಳು',
        basedOn: 'ಲಭ್ಯವಿರುವ ಕ್ಲಿನಿಕಲ್ ಸೂಚಕಗಳ ಆಧಾರದ ಮೇಲೆ ಈ ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗಿದೆ.',
        guidance: 'ಆಹಾರ, ವ್ಯಾಯಾಮ ಮತ್ತು ನಿಯಮಿತ ಪರೀಕ್ಷೆಗಳ ಮೇಲೆ ಗಮನ ನೀಡಿ.',
        reason: 'ನಿಮ್ಮ ಅಪಾಯವನ್ನು ಪ್ರಭಾವಿಸುತ್ತದೆ.',
        urgent: 'ಅಪಾಯ ಹೆಚ್ಚು; ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
        precautions: {
            heart: ['ಉಪ್ಪು ಮತ್ತು ಟ್ರಾನ್ಸ್ ಫ್ಯಾಟ್ ಕಡಿಮೆ ಮಾಡಿ.', 'ವಾರಕ್ಕೆ ಕನಿಷ್ಠ 150 ನಿಮಿಷ ವ್ಯಾಯಾಮ ಮಾಡಿ.', 'ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಲಿಪಿಡ್ ಪ್ರೊಫೈಲ್ ಪರೀಕ್ಷಿಸಿ.'],
            hyper: ['ದೈನಂದಿನ ಉಪ್ಪಿನ ಸೇವನೆ ಕಡಿಮೆ ಮಾಡಿ.', 'ಪ್ರತಿದಿನ ರಕ್ತದೊತ್ತಡವನ್ನು ಗಮನಿಸಿ.', 'ಒತ್ತಡ ಕಡಿಮೆ ಮಾಡಲು ನಿದ್ರೆ ಮತ್ತು ಧ್ಯಾನ ಅನುಸರಿಸಿ.'],
            diabetes: ['ಸಕ್ಕರೆ ಪಾನೀಯ ಮತ್ತು ಜಂಕ್ ಆಹಾರ ಕಡಿಮೆ ಮಾಡಿ.', 'ಫಾಸ್ಟಿಂಗ್ ಗ್ಲೂಕೋಸ್ ಮತ್ತು HbA1c ಪರೀಕ್ಷಿಸಿ.', 'ತೂಕ ನಿಯಂತ್ರಣ ಮತ್ತು ಚುರುಕು ಜೀವನಶೈಲಿ ಇಟ್ಟುಕೊಳ್ಳಿ.'],
        },
    },
    Malayalam: {
        diseases: { heart: 'ഹൃദ്രോഗം', hyper: 'ഉയർന്ന രക്തസമ്മർദ്ദം', diabetes: 'പ്രമേഹം' },
        risk: { low: 'കുറഞ്ഞ അപകടസാധ്യത', moderate: 'മിതമായ അപകടസാധ്യത', high: 'ഉയർന്ന അപകടസാധ്യത' },
        lead: 'പ്രധാന കാരണ ഘടകങ്ങൾ',
        basedOn: 'ലഭ്യമായ ക്ലിനിക്കൽ സൂചനകളെ അടിസ്ഥാനമാക്കി ഈ വിലയിരുത്തൽ തയ്യാറാക്കി.',
        guidance: 'ഭക്ഷണം, വ്യായാമം, സ്ഥിരം പരിശോധന എന്നിവ ശ്രദ്ധിക്കുക.',
        reason: 'നിങ്ങളുടെ അപകടസാധ്യതയെ ബാധിക്കുന്നു.',
        urgent: 'അപകടസാധ്യത കൂടുതലാണ്; ഉടൻ ഡോക്ടറെ കാണുക.',
        precautions: {
            heart: ['ഉപ്പും ട്രാൻസ് ഫാറ്റും കുറയ്ക്കുക.', 'ആഴ്ചയിൽ കുറഞ്ഞത് 150 മിനിറ്റ് വ്യായാമം ചെയ്യുക.', 'ബി.പി., ലിപിഡ് പ്രൊഫൈൽ പരിശോധിക്കുക.'],
            hyper: ['ദിനസരി ഉപ്പ് ഉപയോഗം കുറയ്ക്കുക.', 'രക്തസമ്മർദ്ദം ദിവസേന നിരീക്ഷിക്കുക.', 'മനസമ്മർദ്ദം കുറയ്ക്കാൻ ഉറക്കവും ധ്യാനവും പാലിക്കുക.'],
            diabetes: ['പഞ്ചസാര പാനീയങ്ങളും ജങ്ക് ഫുഡും കുറയ്ക്കുക.', 'ഫാസ്റ്റിംഗ് ഗ്ലൂക്കോസ്, HbA1c പരിശോധിക്കുക.', 'ഭാരനിയന്ത്രണവും സജീവ ജീവിതശൈലിയും പാലിക്കുക.'],
        },
    },
    Bengali: {
        diseases: { heart: 'হৃদরোগ', hyper: 'উচ্চ রক্তচাপ', diabetes: 'ডায়াবেটিস' },
        risk: { low: 'কম ঝুঁকি', moderate: 'মাঝারি ঝুঁকি', high: 'উচ্চ ঝুঁকি' },
        lead: 'প্রধান প্রভাবকারী কারণ',
        basedOn: 'উপলব্ধ ক্লিনিক্যাল সূচকের ভিত্তিতে এই মূল্যায়ন করা হয়েছে।',
        guidance: 'খাদ্য, ব্যায়াম এবং নিয়মিত পরীক্ষা মেনে চলুন।',
        reason: 'আপনার ঝুঁকিকে প্রভাবিত করছে।',
        urgent: 'ঝুঁকি বেশি; দ্রুত চিকিৎসকের পরামর্শ নিন।',
        precautions: {
            heart: ['লবণ ও ট্রান্স-ফ্যাট কমান।', 'সপ্তাহে কমপক্ষে 150 মিনিট ব্যায়াম করুন।', 'রক্তচাপ ও লিপিড প্রোফাইল পরীক্ষা করুন।'],
            hyper: ['দৈনিক লবণ কম খান।', 'প্রতিদিন রক্তচাপ মাপুন।', 'স্ট্রেস কমাতে ঘুম ও ধ্যান করুন।'],
            diabetes: ['মিষ্টি পানীয় ও জাঙ্ক ফুড কমান।', 'ফাস্টিং গ্লুকোজ ও HbA1c পরীক্ষা করুন।', 'ওজন নিয়ন্ত্রণ ও সক্রিয় জীবনযাপন করুন।'],
        },
    },
    Punjabi: {
        diseases: { heart: 'ਦਿਲ ਦੀ ਬਿਮਾਰੀ', hyper: 'ਉੱਚ ਰਕਤਚਾਪ', diabetes: 'ਸ਼ੂਗਰ' },
        risk: { low: 'ਘੱਟ ਖਤਰਾ', moderate: 'ਦਰਮਿਆਨਾ ਖਤਰਾ', high: 'ਉੱਚ ਖਤਰਾ' },
        lead: 'ਮੁੱਖ ਪ੍ਰਭਾਵਸ਼ਾਲੀ ਕਾਰਕ',
        basedOn: 'ਉਪਲਬਧ ਕਲੀਨਿਕਲ ਸੰਕੇਤਾਂ ਦੇ ਆਧਾਰ ਤੇ ਇਹ ਅੰਕਲਨ ਕੀਤਾ ਗਿਆ ਹੈ।',
        guidance: 'ਖੁਰਾਕ, ਕਸਰਤ ਅਤੇ ਨਿਯਮਿਤ ਜਾਂਚ ਤੇ ਧਿਆਨ ਦਿਓ।',
        reason: 'ਤੁਹਾਡੇ ਖਤਰੇ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰ ਰਿਹਾ ਹੈ।',
        urgent: 'ਖਤਰਾ ਉੱਚ ਹੈ; ਤੁਰੰਤ ਡਾਕਟਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
        precautions: {
            heart: ['ਨਮਕ ਅਤੇ ਟ੍ਰਾਂਸ-ਫੈਟ ਘਟਾਓ।', 'ਹਫ਼ਤੇ ਵਿੱਚ ਘੱਟੋ-ਘੱਟ 150 ਮਿੰਟ ਕਸਰਤ ਕਰੋ।', 'ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਅਤੇ ਲਿਪਿਡ ਪ੍ਰੋਫਾਈਲ ਚੈਕ ਕਰੋ।'],
            hyper: ['ਰੋਜ਼ਾਨਾ ਨਮਕ ਘੱਟ ਕਰੋ।', 'ਰੋਜ਼ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਮਾਪੋ।', 'ਤਣਾਅ ਘਟਾਉਣ ਲਈ ਨੀਂਦ ਅਤੇ ਧਿਆਨ ਕਰੋ।'],
            diabetes: ['ਮਿੱਠੇ ਪੇਅ ਅਤੇ ਜੰਕ ਫੂਡ ਘਟਾਓ।', 'ਫਾਸਟਿੰਗ ਗਲੂਕੋਜ਼ ਅਤੇ HbA1c ਜਾਂਚੋ।', 'ਵਜ਼ਨ ਕੰਟਰੋਲ ਅਤੇ ਸਰਗਰਮ ਜੀਵਨਸ਼ੈਲੀ ਰੱਖੋ।'],
        },
    },
    Assamese: {
        diseases: { heart: 'হৃদৰোগ', hyper: 'উচ্চ ৰক্তচাপ', diabetes: 'ডায়াবেটিছ' },
        risk: { low: 'কম ঝুঁকি', moderate: 'মধ্যম ঝুঁকি', high: 'উচ্চ ঝুঁকি' },
        lead: 'মুখ্য প্ৰভাৱকাৰী কাৰকসমূহ',
        basedOn: 'উপলব্ধ ক্লিনিকেল সূচকৰ ভিত্তিত এই মূল্যায়ন কৰা হৈছে।',
        guidance: 'আহাৰ, ব্যায়াম আৰু নিয়মীয়া পৰীক্ষাৰ ওপৰত গুৰুত্ব দিয়ক।',
        reason: 'আপোনাৰ ঝুঁকিক প্ৰভাৱিত কৰি আছে।',
        urgent: 'ঝুঁকি অধিক; সোনকালেই ডাক্তৰৰ পৰামৰ্শ লওক।',
        precautions: {
            heart: ['লৱণ আৰু ট্রান্স-ফ্যাট কমাওক।', 'সপ্তাহত কমেও 150 মিনিট ব্যায়াম কৰক।', 'বিপি আৰু লিপিড প্রোফাইল পৰীক্ষা কৰক।'],
            hyper: ['দৈনিক লৱণ কম খাওক।', 'প্রতিদিন ৰক্তচাপ মনিটৰ কৰক।', 'মানসিক চাপ কমাবলৈ শুই থাকিব আৰু ধ্যান কৰক।'],
            diabetes: ['মিঠা পানীয় আৰু জাঙ্ক ফুড কমাওক।', 'ফাস্টিং গ্লুকোজ আৰু HbA1c পৰীক্ষা কৰক।', 'ওজন নিয়ন্ত্ৰণ আৰু সক্রিয় জীৱনশৈলী ৰাখক।'],
        },
    },
    Odia: {
        diseases: { heart: 'ହୃଦରୋଗ', hyper: 'ଉଚ୍ଚ ରକ୍ତଚାପ', diabetes: 'ମଧୁମେହ' },
        risk: { low: 'କମ ଝୁକି', moderate: 'ମଧ୍ୟମ ଝୁକି', high: 'ଉଚ୍ଚ ଝୁକି' },
        lead: 'ମୁଖ୍ୟ ପ୍ରଭାବଶାଳୀ କାରକ',
        basedOn: 'ଉପଲବ୍ଧ କ୍ଲିନିକାଲ ସଙ୍କେତ ଆଧାରରେ ଏହି ମୂଲ୍ୟାୟନ କରାଯାଇଛି।',
        guidance: 'ଆହାର, ବ୍ୟାୟାମ ଏବଂ ନିୟମିତ ପରୀକ୍ଷା ଉପରେ ଧ୍ୟାନ ଦିଅନ୍ତୁ।',
        reason: 'ଆପଣଙ୍କ ଝୁକିକୁ ପ୍ରଭାବିତ କରୁଛି।',
        urgent: 'ଝୁକି ଅଧିକ; ଶୀଘ୍ର ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।',
        precautions: {
            heart: ['ଲୁଣ ଏବଂ ଟ୍ରାନ୍ସ-ଫ୍ୟାଟ କମାନ୍ତୁ।', 'ସପ୍ତାହକୁ କମ୍ରେ କମ୍ 150 ମିନିଟ୍ ବ୍ୟାୟାମ କରନ୍ତୁ।', 'ରକ୍ତଚାପ ଏବଂ ଲିପିଡ ପ୍ରୋଫାଇଲ ଯାଞ୍ଚ କରନ୍ତୁ।'],
            hyper: ['ଦିନକୁ ଲୁଣ କମ୍ ଖାଆନ୍ତୁ।', 'ପ୍ରତିଦିନ ରକ୍ତଚାପ ମାପନ୍ତୁ।', 'ତଣାପୋଡ଼ କମାଇବାକୁ ଘୁମ ଏବଂ ଧ୍ୟାନ କରନ୍ତୁ।'],
            diabetes: ['ମିଠା ପାନୀୟ ଏବଂ ଜଙ୍କ ଖାଦ୍ୟ କମାନ୍ତୁ।', 'ଫାଷ୍ଟିଂ ଗ୍ଲୁକୋଜ ଏବଂ HbA1c ଯାଞ୍ଚ କରନ୍ତୁ।', 'ଓଜନ ନିୟନ୍ତ୍ରଣ ଏବଂ ସକ୍ରିୟ ଜୀବନଶୈଳୀ ରଖନ୍ତୁ।'],
        },
    },
    Urdu: {
        diseases: { heart: 'دل کی بیماری', hyper: 'ہائی بلڈ پریشر', diabetes: 'ذیابیطس' },
        risk: { low: 'کم خطرہ', moderate: 'درمیانی خطرہ', high: 'زیادہ خطرہ' },
        lead: 'اہم اثر انداز عوامل',
        basedOn: 'دستیاب طبی اشاروں کی بنیاد پر یہ جائزہ تیار کیا گیا ہے۔',
        guidance: 'خوراک، ورزش اور باقاعدہ ٹیسٹ پر توجہ دیں۔',
        reason: 'آپ کے خطرے کو متاثر کر رہا ہے۔',
        urgent: 'خطرہ زیادہ ہے؛ فوری طور پر ڈاکٹر سے رجوع کریں۔',
        precautions: {
            heart: ['نمک اور ٹرانس فیٹ کم کریں۔', 'ہفتے میں کم از کم 150 منٹ ورزش کریں۔', 'بلڈ پریشر اور لپڈ پروفائل ٹیسٹ کروائیں۔'],
            hyper: ['روزانہ نمک کم استعمال کریں۔', 'روز بلڈ پریشر مانیٹر کریں۔', 'ذہنی دباؤ کم کرنے کے لئے نیند اور مراقبہ کریں۔'],
            diabetes: ['میٹھے مشروبات اور جنک فوڈ کم کریں۔', 'فاسٹنگ گلوکوز اور HbA1c ٹیسٹ کروائیں۔', 'وزن کنٹرول اور فعال طرز زندگی اپنائیں۔'],
        },
    },
    Kashmiri: {
        diseases: { heart: 'دلہٕ ہٕنٛد مرض', hyper: 'تِیز خون دباؤ', diabetes: 'ذیابطس' },
        risk: { low: 'کم خطرو', moderate: 'درمیانہ خطرو', high: 'زیادٕ خطرو' },
        lead: 'اہم اثر کرن والہٕ کارک',
        basedOn: 'دستیاب طبی اشارن ہُنٛد بنیادس پٮ۪ٹھ یہ اندازٕ تیار کرنہٕ آمت۔',
        guidance: 'خوراک، ورزش تہٕ باقاعدہ ٹیسٹن پٮ۪ٹھ دھیان دیو۔',
        reason: 'توہند خطراہس پٮ۪ٹھ اثر کران چھُ۔',
        urgent: 'خطرو زیادٕ چھُ؛ جلد ڈاکٹرہٕ سٕتۍ رابطہٕ کٔرۍو۔',
        precautions: {
            heart: ['نمک تہٕ ٹرانس فیٹ کم کٔرۍو۔', 'ہفتس منز کم از کم 150 منٹ ورزش کٔرۍو۔', 'بلڈ پریشر تہٕ لپڈ پروفائل ٹیسٹ کٔرۍو۔'],
            hyper: ['روزانہ نمک کم استعمال کٔرۍو۔', 'روز بلڈ پریشر مانیٹر کٔرۍو۔', 'تناؤ کم کرنہٕ باپتھ نیند تہٕ دھیان کٔرۍو۔'],
            diabetes: ['میٹھہٕ پینۍ تہٕ جنک فوڈ کم کٔرۍو۔', 'فاسٹنگ گلوکوز تہٕ HbA1c ٹیسٹ کٔرۍو۔', 'وزن کنٹرول تہٕ فعال طرزِ زندگی اپنایو۔'],
        },
    },
}

function getRiskText(level: SupportedRiskLevel | undefined, languagePack: LanguagePack): string {
    if (level === 'HIGH') return languagePack.risk.high
    if (level === 'MODERATE') return languagePack.risk.moderate
    return languagePack.risk.low
}

function localizeMlResultsFallback(analysisResults: any, language: string) {
    const pack = LANGUAGE_PACKS[language as AppLanguage]
    if (!pack) return

    const diseases = ['Heart Disease', 'Hypertension', 'Diabetes']

    for (const disease of diseases) {
        const diseaseRes = analysisResults[disease] || {}
        const riskText = getRiskText(diseaseRes.risk_level as SupportedRiskLevel, pack)
        const drivers = (diseaseRes.top_risk_drivers || []).slice(0, 3)
        const driverLabels = drivers.map((d: any) => d.label || d.feature || pack.lead)

        const diseaseLabel = disease === 'Heart Disease'
            ? pack.diseases.heart
            : disease === 'Hypertension'
                ? pack.diseases.hyper
                : pack.diseases.diabetes

        const baseSummary = `${diseaseLabel}: ${riskText}.`
        const driverSummary = driverLabels.length > 0
            ? `${pack.lead}: ${driverLabels.join(', ')}.`
            : pack.basedOn

        diseaseRes.summary_paragraph = `${baseSummary} ${driverSummary} ${pack.guidance}`

        diseaseRes.top_risk_drivers = drivers.map((d: any) => {
            const label = d.label || d.feature || pack.lead
            return {
                ...d,
                label,
                reason: `${label} ${pack.reason}`
            }
        })

        const precautions: string[] = []
        if (disease === 'Heart Disease') {
            precautions.push(...pack.precautions.heart)
        } else if (disease === 'Hypertension') {
            precautions.push(...pack.precautions.hyper)
        } else {
            precautions.push(...pack.precautions.diabetes)
        }

        if ((diseaseRes.risk_level as SupportedRiskLevel) === 'HIGH') {
            precautions.unshift(pack.urgent)
        }

        diseaseRes.precautions = precautions
        analysisResults[disease] = diseaseRes
    }
}

// Helper functions to map form values to ML model expected values
function mapSmoking(smoker: string): "Non-Smoker" | "Former Smoker" | "Regular Smoker" | "Heavy Smoker" {
    switch (smoker) {
        case 'Yes':
            return 'Regular Smoker'
        case 'Former':
            return 'Former Smoker'
        case 'No':
        default:
            return 'Non-Smoker'
    }
}

function mapActivity(activity: string): "Very Active" | "Sedentary" | "Light" | "Moderate" | "Active" {
    switch (activity) {
        case 'Light':
            return 'Light'
        case 'Moderate':
        case 'Moderately Active':
            return 'Moderate'
        case 'Active':
            return 'Active'
        case 'Very Active':
            return 'Very Active'
        case 'Sedentary':
        default:
            return 'Sedentary'
    }
}

function mapStress(stress: string): "Low" | "High" | "Moderate" {
    switch (stress) {
        case 'Low':
            return 'Low'
        case 'Moderate':
        case 'Medium':
            return 'Moderate'
        case 'High':
            return 'High'
        default:
            return 'Moderate'
    }
}

function mapSaltIntake(salt: string): "Low" | "High" | "Medium" {
    switch (salt) {
        case 'Low':
            return 'Low'
        case 'Medium':
        case 'Moderate':
            return 'Medium'
        case 'High':
            return 'High'
        default:
            return 'Medium'
    }
}

export async function analyzeHealthData(data: any, language: string = 'English') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    try {
        // Map form field names to ML input field names
        const mlInput: HealthInput = {
            age: Number(data.age) || 40,
            sex: (data.sex === 'Female' ? 'Female' : 'Male'),
            bmi: Number(data.bmi) || 25,
            waist: Number(data.waist_circumference) || (data.sex === 'Female' ? 80 : 90),
            systolic_bp: Number(data.systolic_bp) || 120,
            diastolic_bp: Number(data.diastolic_bp) || 80,
            heart_rate: Number(data.resting_heart_rate) || 72,
            history: (data.heart_disease || data.hypertension) ? 'Yes' : 'None',
            total_cholesterol: Number(data.total_cholesterol) || 200,
            ldl: Number(data.ldl_cholesterol) || 130,
            hdl: Number(data.hdl_cholesterol) || 50,
            triglycerides: Number(data.triglycerides) || 130,
            fasting_glucose: Number(data.fasting_glucose) || 100,
            hba1c: Number(data.hba1c) || 5.5,
            smoking: mapSmoking(data.smoking_status || 'No'),
            activity: mapActivity(data.physical_activity || 'Sedentary'),
            stress: mapStress(data.stress_level || 'Moderate'),
            salt_intake: mapSaltIntake(data.salt_intake || 'Medium')
        };

        // Try ML first, fallback to Gemini
        let analysisResults: any;
        let analysisSource: 'ml' | 'gemini' = 'ml';

        const mlResults = await runMLBridge(mlInput);

        if ('error' in mlResults) {
            // ML failed, fallback to Gemini
            console.log('ML unavailable, using Gemini fallback:', mlResults.error);
            const geminiResults = await analyzeHealthWithGemini(mlInput, language);
            if ('error' in geminiResults) return geminiResults;
            analysisResults = geminiResults.data;
            analysisSource = 'gemini';
        } else {
            console.log('ML Success, deciding language-aware response strategy...');
            analysisResults = mlResults;

            if (language && language !== 'English') {
                // For non-English, generate full assessment directly from raw inputs via Gemini.
                // This avoids post-translation and gives language-native clinical output.
                const geminiResults = await analyzeHealthWithGemini(mlInput, language);
                if (!('error' in geminiResults)) {
                    const geminiData = geminiResults.data || {};
                    const localizedSample = [
                        geminiData['Heart Disease']?.summary_paragraph || '',
                        geminiData['Hypertension']?.summary_paragraph || '',
                        geminiData['Diabetes']?.summary_paragraph || ''
                    ].join(' ');

                    const hasAllDiseases =
                        !!geminiData['Heart Disease'] &&
                        !!geminiData['Hypertension'] &&
                        !!geminiData['Diabetes'];

                    // Guard: If output is malformed or still predominantly English, fallback to deterministic localization.
                    if (hasAllDiseases && !isProbablyEnglishText(localizedSample)) {
                        analysisResults = geminiData;
                        analysisSource = 'gemini';
                    } else {
                        analysisResults = mlResults;
                        localizeMlResultsFallback(analysisResults, language)
                    }
                } else {
                    // If Gemini is unavailable (quota/API issues), localize ML results deterministically.
                    localizeMlResultsFallback(analysisResults, language)
                }
            } else {
                // English path: enrich ML output only when explainability content is missing.
                const heartDrivers = analysisResults["Heart Disease"]?.top_risk_drivers || [];
                if (heartDrivers.length === 0) {
                    const explanationResult = await explainMLWithGemini(mlInput, analysisResults, language);
                    if (!('error' in explanationResult)) {
                        const expl = explanationResult.data;
                        for (const disease of ["Heart Disease", "Hypertension", "Diabetes"]) {
                            if (expl[disease]) {
                                analysisResults[disease].top_risk_drivers = (expl[disease].top_risk_drivers || []).map((d: any) => ({
                                    label: d.label,
                                    feature: d.label.toLowerCase().replace(/ /g, '_'),
                                    shap: 0.1, // Dummy impact for UI
                                    value: 0,
                                    reason: d.reason
                                }));
                                analysisResults[disease].summary_paragraph = expl[disease].summary_paragraph;
                                analysisResults[disease].precautions = expl[disease].precautions || [];
                            }
                        }
                    }
                }
            }
        }

        // Format Data for UI
        const heartRes = analysisResults["Heart Disease"] || {};
        const hyperRes = analysisResults["Hypertension"] || {};
        const diabRes = analysisResults["Diabetes"] || {};

        // Build comprehensive overall assessment
        const buildOverallAssessment = () => {
            if (language && language !== 'English') {
                // If not English, combine the localized summaries from each disease
                const segments = [
                    heartRes.summary_paragraph,
                    hyperRes.summary_paragraph,
                    diabRes.summary_paragraph
                ].filter(Boolean);
                
                return segments.length > 0 
                  ? segments.slice(0, 3).join(" ") 
                  : `Clinical assessment complete in ${language}.`;
            }

            const risks = [];
            if (heartRes.risk_level) risks.push(`${heartRes.risk_level.toLowerCase()} risk of heart disease`);
            if (hyperRes.risk_level) risks.push(`${hyperRes.risk_level.toLowerCase()} risk of hypertension`);
            if (diabRes.risk_level) risks.push(`${diabRes.risk_level.toLowerCase()} risk of diabetes`);

            // Sort all drivers globally by absolute SHAP impact
            const allRiskDrivers = [
                ...(heartRes.top_risk_drivers || []),
                ...(hyperRes.top_risk_drivers || []),
                ...(diabRes.top_risk_drivers || [])
            ].sort((a: any, b: any) => Math.abs(b.shap || 0) - Math.abs(a.shap || 0));

            const driverNames = Array.from(new Set(allRiskDrivers.slice(0, 4).map((d: any) => d.label || d.feature)));
            
            // Get combined protective factors
            const allProtective = [
                ...(heartRes.protective_factors || []),
                ...(hyperRes.protective_factors || []),
                ...(diabRes.protective_factors || [])
            ].sort((a: any, b: any) => Math.abs(b.shap || 0) - Math.abs(a.shap || 0));
            const protectiveNames = Array.from(new Set(allProtective.slice(0, 2).map((d: any) => d.label || d.feature)));

            let summary = `Your personalized health analysis indicates ${risks.join(', ')}.`;
            
            if (driverNames.length > 0) {
                summary += ` The strongest clinical markers influencing these results are ${driverNames.join(', ')}.`;
            }

            if (protectiveNames.length > 0) {
                summary += ` On a positive note, ${protectiveNames.join(' and ')} are currently acting as protective factors for your profile.`;
            }
            
            const highRiskCount = [heartRes, hyperRes, diabRes].filter(r => r.risk_level === 'HIGH').length;
            if (highRiskCount > 0) {
                summary += ` Given the presence of high-risk areas, we strongly recommend reviewing these findings with a healthcare provider to develop a formal clinical management plan.`;
            } else if ([heartRes, hyperRes, diabRes].some(r => r.risk_level === 'MODERATE')) {
                summary += ` Focus on targeted lifestyle adjustments to bring these moderate risk areas back into the optimal range.`;
            } else {
                summary += ` Your current indicators are largely positive. Continue your existing health and wellness routine.`;
            }
            
            return summary;
        };

        // Build predictions array
        const buildPrediction = (res: any, disease: string) => ({
            disease,
            probability: `${res.risk_percent || 0}%`,
            riskLevel: res.risk_level === 'HIGH' ? 'High' :
                       res.risk_level === 'MODERATE' ? 'Medium' : 'Low',
            confidence: res.confidence || 0,
            topRiskDrivers: res.top_risk_drivers || [],
            protectiveFactors: res.protective_factors || [],
            modelProbabilities: res.model_probabilities || {},
            summaryParagraph: res.summary_paragraph || '',
            precautions: res.precautions || [],
            reasoning: res.summary_paragraph ? res.summary_paragraph.split('.').slice(0, 2).join('.') + '.' : `${disease} risk assessment.`
        });

        const uiOutput = {
            overallAssessment: buildOverallAssessment(),
            healthScore: analysisResults.health_score || 0,
            analysisSource: analysisSource,
            version: analysisResults.version || (analysisSource === 'ml' ? 'v10' : 'gemini'),
            predictions: [
                buildPrediction(heartRes, 'Heart Disease'),
                buildPrediction(hyperRes, 'Hypertension'),
                buildPrediction(diabRes, 'Diabetes')
            ],
            suggestions: [
                ...(heartRes.recommendations || []),
                ...(hyperRes.recommendations || []),
                ...(diabRes.recommendations || [])
            ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5) || ['Consult with your healthcare provider for personalized recommendations.'],
            disclaimer: `HealthBuddy's health assessment powered by ${analysisSource === 'ml' ? '6-model ML ensemble' : 'Gemini AI'} provides risk estimation, not medical diagnosis. Always consult a physician.`
        };

        // Call Groq for detailed interpretation
        let groqAnalysisText = null;
        try {
            groqAnalysisText = await generateGroqDetailedAnalysis(analysisResults, analysisResults.health_score || 0);
            if (groqAnalysisText) {
                (uiOutput as any).groq_analysis = groqAnalysisText;
            }
        } catch (e) {
            console.error('Groq analysis failed:', e);
        }

        // Persist Full Report for History
        if (user) {
            const severity = (
                heartRes.risk_level === 'HIGH' ||
                hyperRes.risk_level === 'HIGH' ||
                diabRes.risk_level === 'HIGH'
            ) ? 'critical' : 'normal';

            const healthScore = analysisResults.health_score || Math.round(
                100 - ((
                    (parseFloat(heartRes.risk_percent) || 0) +
                    (parseFloat(hyperRes.risk_percent) || 0) +
                    (parseFloat(diabRes.risk_percent) || 0)
                ) / 3)
            );

            const { data: assessment, error: aError } = await supabase
                .from('health_assessments')
                .insert({
                    patient_id: user.id,
                    inputs: mlInput,
                    probabilities: {
                        heart_disease: (parseFloat(heartRes.risk_percent) || 0) / 100,
                        hypertension: (parseFloat(hyperRes.risk_percent) || 0) / 100,
                        diabetes: (parseFloat(diabRes.risk_percent) || 0) / 100
                    },
                    confidence_scores: {
                        heart_disease: (parseFloat(heartRes.confidence) || 95) / 100,
                        hypertension: (parseFloat(hyperRes.confidence) || 95) / 100,
                        diabetes: (parseFloat(diabRes.confidence) || 95) / 100
                    },
                    shap_values: {
                        heart_disease: heartRes.top_risk_drivers || [],
                        hypertension: hyperRes.top_risk_drivers || [],
                        diabetes: diabRes.top_risk_drivers || []
                    },
                    health_score: healthScore,
                    explanation: {
                        summary: heartRes.summary_paragraph || 'Assessment complete',
                        recommendations: heartRes.recommendations || [],
                        flags: heartRes.clinical_flags || [],
                        source: analysisSource
                    },
                    severity: severity
                })
                .select()
                .single();

            if (assessment) {
                await supabase
                    .from('reports')
                    .insert({
                        patient_id: user.id,
                        assessment_id: assessment.id,
                        title: 'AI Health Risk Assessment',
                        type: 'ai-checkup',
                        summary: groqAnalysisText || heartRes.summary_paragraph || 'Clinical assessment completed.',
                        content: {
                            ...uiOutput,
                            ml_raw: analysisResults,
                            patient_name: user?.user_metadata?.full_name || 'Patient'
                        },
                        severity: severity,
                        status: 'generated'
                    });
            }
        }

        return { data: uiOutput }

    } catch (error: any) {
        console.error('Health Assessment Error:', error)
        return { error: 'Failed to analyze health data. Please ensure all fields are filled correctly.' }
    }
}

export async function getReportPDFData(reportId: string) {
    const supabase = await createClient();
    
    // Fetch report with patient and assessment data
    const { data: report, error } = await supabase
        .from('reports')
        .select(`
            *,
            patient:patient_id(*),
            assessment:assessment_id(*)
        `)
        .eq('id', reportId)
        .single();

    if (error || !report) {
        console.error('getReportPDFData Error:', error);
        return null;
    }

    const patient = report.patient;
    const assessment = report.assessment;
    const content = report.content || {};

    const scaleProb = (v: any) => {
        const val = parseFloat(v);
        if (isNaN(val)) return 0;
        return val <= 1 ? val * 100 : val;
    };

    // Standardize data for Python template
    return {
        patient: patient?.full_name || content.patient_name || 'Patient',
        email: patient?.email || '',
        report_id: report.id.substring(0, 8),
        date: new Date(report.created_at).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        }),
        severity: report.severity || 'normal',
        health_score: report.health_score || assessment?.health_score || 0,
        probs: {
            'Heart Disease': scaleProb(assessment?.probabilities?.heart_disease || content.ml_raw?.["Heart Disease"]?.risk_percent),
            'Hypertension': scaleProb(assessment?.probabilities?.hypertension || content.ml_raw?.["Hypertension"]?.risk_percent),
            'Diabetes': scaleProb(assessment?.probabilities?.diabetes || content.ml_raw?.["Diabetes"]?.risk_percent)
        },
        conf: {
            'Score Confidence': scaleProb(assessment?.confidence_scores?.heart_disease || content.ml_raw?.["Heart Disease"]?.confidence || 0.95)
        },
        inputs: assessment?.inputs ? Object.entries(assessment.inputs).map(([k, v]) => [
            k.replace('_', ' ').toUpperCase(), v, 'normal'
        ]) : content.inputs || [],
        factors: assessment?.explanation?.summary ? [assessment.explanation.summary] : (content.overallAssessment ? [content.overallAssessment] : []),
        recs: (assessment?.explanation?.recommendations || content.suggestions || []).map((r: any) => {
           if (typeof r === 'string') return ['HIGH', r];
           return [r.priority || 'HIGH', (r.title || '') + (r.body ? ": " + r.body : "")];
        }),
        summary: report.summary || assessment?.explanation?.summary || content.overallAssessment || "Clinical assessment complete.",
        emergency: content.disclaimer || "Seek immediate medical attention for acute symptoms.",
        shap: assessment?.shap_values ? Object.entries(assessment.shap_values).flatMap(([disease, drivers]: [string, any]) => 
            drivers.map((d: any) => [d.feature, disease.replace('_', ' ').toUpperCase(), d.shap, d.shap > 0])
        ) : (content.ml_raw?.["Heart Disease"]?.top_risk_drivers || []).map((d: any) => [d.feature, 'HEART DISEASE', d.shap, d.shap > 0])
    };
}
