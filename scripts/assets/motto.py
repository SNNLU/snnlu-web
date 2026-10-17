# 校训「重德博学 务实尚美」：从 sicnu.edu.cn 师大标识页的书法原图逐字描成矢量，
# 每个字放到旧页头里同一个字的位置与大小，输出 motto.svg。
# 原图：https://www.sicnu.edu.cn/images/n-img-7.png（192×430，竖排两列）
# 用法：python scripts/assets/motto.py n-img-7.png public/img/motto.svg   （需要 numpy、pillow、opencv-python、potracer）
import sys
import numpy as np, cv2, potrace
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
FILL = '#19533b'
UP = 8                                   # 先放大再描，曲线更顺
a = np.asarray(Image.open(src).convert('L')).astype(np.float32)

# 原图里每个字的框（去掉膨胀的 4px）
SRC = {
    '重': (116, 10, 47, 103), '德': (110, 123, 56, 72), '博': (113, 226, 53, 82), '学': (114, 330, 56, 90),
    '务': (27, 26, 58, 88), '实': (19, 121, 68, 86), '尚': (22, 230, 65, 78), '美': (19, 325, 64, 92),
}
SRC = {k: (x + 4, y + 4, w - 8, h - 8) for k, (x, y, w, h) in SRC.items()}
# 旧页头里每个字的框（1920 画布坐标）
DST = {
    '重': (1584, 16, 27, 65), '德': (1633, 29, 34, 44), '博': (1682, 24, 31, 52), '学': (1730, 21, 34, 58),
    '务': (1678, 90, 34, 44), '实': (1722, 88, 41, 52), '尚': (1774, 90, 38, 48), '美': (1826, 85, 37, 54),
}
OX, OY, W, H = 1578, 10, 292, 136        # 输出 SVG 的范围（画布坐标）

def trace(ch):
    x, y, w, h = SRC[ch]
    pad = 4
    crop = a[max(0, y - pad):y + h + pad, max(0, x - pad):x + w + pad]
    big = cv2.resize(crop, None, fx=UP, fy=UP, interpolation=cv2.INTER_CUBIC)
    big = cv2.GaussianBlur(big, (0, 0), UP * 0.45)
    ink = big < 128
    # 去掉框线等杂点：只留面积够大的连通块
    n, lab, st, _ = cv2.connectedComponentsWithStats(ink.astype(np.uint8))
    keep = np.isin(lab, [i for i in range(1, n) if st[i, 4] > 40 * UP * UP / 4])
    # potracer 把 False 当作墨迹，所以传反相
    paths = potrace.Bitmap(~keep).trace(turdsize=8 * UP, alphamax=1.0, opticurve=True, opttolerance=0.3)
    ys, xs = np.nonzero(keep)
    return paths, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)

parts = []
for ch, (dx, dy, dw, dh) in DST.items():
    paths, (bx0, by0, bx1, by1) = trace(ch)
    bw, bh = bx1 - bx0, by1 - by0
    s = min(dw / bw, dh / bh) * 1.02    # 等比缩放，贴合旧框
    tx = dx + dw / 2 - (bx0 + bw / 2) * s - OX
    ty = dy + dh / 2 - (by0 + bh / 2) * s - OY
    f = lambda pt: f'{pt.x * s + tx:.2f} {pt.y * s + ty:.2f}'
    d = []
    for c in paths:
        d.append('M' + f(c.start_point))
        for seg in c.segments:
            if seg.is_corner:
                d.append('L' + f(seg.c) + 'L' + f(seg.end_point))
            else:
                d.append('C' + f(seg.c1) + ' ' + f(seg.c2) + ' ' + f(seg.end_point))
        d.append('Z')
    parts.append(f'<path d="{"".join(d)}"/>')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
       f'<title>重德博学 务实尚美</title><g fill="{FILL}" fill-rule="evenodd">' + ''.join(parts) + '</g></svg>\n')
open(out, 'w', encoding='utf-8').write(svg)
print('motto.svg', len(svg), 'bytes')
