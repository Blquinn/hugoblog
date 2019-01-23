import hashlib
import mimetypes
import os
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

import boto3

bucket = 'bquinn-hugoblog'
cloudfront_dist_id = 'ECH433SQB2WMU'
media_dir = 'media'
public_dir = 'public'


def md5_hash_bytes(bts: bytes) -> bytes:
    h = hashlib.md5()
    h.update(bts)
    return h.hexdigest()


def get_directory_paths(target_dir_path: str) -> List[Path]:
    return [
        Path(os.path.join(dir_path, f))
        for (dir_path, _, filenames) in os.walk(target_dir_path)
        for f in filenames
    ]


def get_paths_with_hashes(paths: List[Path], target_dir: str) -> List[Tuple[str, bytes]]:
    return [(os.path.relpath(p.as_posix(), target_dir), md5_hash_bytes(p.read_bytes())) for p in paths]


def main():
    if not os.path.exists(public_dir):
        raise OSError('Public directory not found.')

    s3 = boto3.client('s3')
    cloudfront = boto3.client('cloudfront')

    res = s3.list_objects_v2(Bucket=bucket)

    s3paths = set([
        (c['Key'], c['ETag'].strip('"'))
        for c in res['Contents']
    ])

    local_paths = set(get_paths_with_hashes(get_directory_paths(public_dir), public_dir))

    invalidate = []
    missing_or_different = local_paths.difference(s3paths)
    if missing_or_different:
        for (p, _) in missing_or_different:
            local_path = os.path.join(public_dir, p)
            invalidate.append('/' + p)
            print('Putting {} -> s3://{}/{}'.format(local_path, bucket, p))

            full_path = os.path.join(public_dir, p)
            extension = os.path.splitext(full_path)[1]
            encoding = mimetypes.types_map.get(extension)

            with open(full_path, 'rb') as f:
                if encoding:
                    s3.put_object(ACL='public-read', Bucket=bucket, Key=p, Body=f, ContentType=encoding)
                else:
                    s3.put_object(ACL='public-read', Bucket=bucket, Key=p, Body=f)

    excess = set(
        p for (p, _) in s3paths.difference(local_paths).difference(missing_or_different)
        if not p.startswith(media_dir))

    if excess:
        for p in excess:
            invalidate.append('/' + p)
            print('Removing s3://{}/{}'.format(bucket, p))

        s3.delete_objects(Bucket=bucket, Delete={
            'Objects': [{'Key': p} for p in excess]
        })

    if not invalidate:
        print('0 objects removed/updated, skipping invalidation')
        exit(0)

    for p in invalidate:
        print('Invalidating {}'.format(p))

    cloudfront.create_invalidation(DistributionId=cloudfront_dist_id, InvalidationBatch={
        'Paths': {
            'Quantity': len(invalidate),
            'Items': invalidate
        },
        'CallerReference': datetime.now().isoformat()
    })


if __name__ == '__main__':
    main()
