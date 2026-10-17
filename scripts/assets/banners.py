# 首页横幅：由 2000×484 的原图生成三档 WebP（2000 / 1280 / 750 宽），供 <img srcset> 按屏宽挑选。
# 文件名约定：banner-<n>.webp 是 2000 宽原档，banner-<n>-<宽>.webp 是缩小档（HeroCarousel 按此拼 srcset）。
# 用法：python scripts/assets/banners.py <原图> <序号> [<原图> <序号> ...]   （需要 pillow）
import shutil
import sys
from PIL import Image

WIDTHS = (1280, 750)
args = sys.argv[1:]
for src, n in zip(args[::2], args[1::2]):
    im = Image.open(src).convert('RGB')
    # 原图已是 2000 宽 WebP 就原样拷贝，免得再压一遍
    if im.width == 2000 and src.lower().endswith('.webp'):
        shutil.copyfile(src, f'public/img/banner-{n}.webp')
    else:
        im.save(f'public/img/banner-{n}.webp', quality=86, method=6)
    for w in WIDTHS:
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(f'public/img/banner-{n}-{w}.webp', quality=84, method=6)
    print(f'banner-{n}', im.size)
