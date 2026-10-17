# 首页横幅：由高分辨率原图生成 3840 / 2560 / 2000 / 1280 / 750 五档 WebP。
# banner-<n>.webp 是 2000 主档（src 回退），banner-<n>-<宽>.webp 是其余档（HeroCarousel 拼 srcset）。
# 用法：python scripts/assets/banners.py <原图> <序号> [<原图> <序号> ...]   （需要 pillow）
import sys
from PIL import Image

MAIN = 2000
WIDTHS = (3840, 2560, 1280, 750)
args = sys.argv[1:]
for src, n in zip(args[::2], args[1::2]):
    im = Image.open(src).convert('RGB')
    im.resize((MAIN, round(im.height * MAIN / im.width)), Image.LANCZOS).save(f'public/img/banner-{n}.webp', quality=86, method=6)
    for w in WIDTHS:
        if w > im.width:
            continue
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(f'public/img/banner-{n}-{w}.webp', quality=88 if w >= 2560 else 84, method=6)
    print(f'banner-{n}', im.size)
