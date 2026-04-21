from huggingface_hub import HfApi

api = HfApi(token='HF_TOKEN_REDACTED')
api.upload_file(
    path_or_fileobj='d:/health buddy 2.0/health buddy ml v10/requirements.txt',
    path_in_repo='requirements.txt',
    repo_id='anilsuthar2004/health-buddy-ml',
    repo_type='space'
)
print('requirements.txt uploaded!')
