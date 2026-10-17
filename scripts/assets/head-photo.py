# 页头实景层：照片 → 与旧页头同样的淡色剪影（楼与树比天空暗一点，再叠一层细节），
# 左右两端渐隐到底色 #286F51，输出 2 倍图。
# 照片：湖边的玻璃幕墙塔楼与圆楼（1775×886）。
# 用法：python scripts/assets/head-photo.py <照片> public/img/head-photo.webp   （需要 numpy、pillow、opencv-python）
import sys
import numpy as np
from PIL import Image
import cv2

src, out = sys.argv[1], sys.argv[2]
BASE = np.array([40, 111, 81], np.float64)   # 页头底色 #286F51
S = 0.48                                      # 照片 → 页头（1x）缩放
X0, X1 = 560, 1400                            # 图层在 1200 版心中的横向范围（1x）
TOWER_X, TOWER_Y = 650, 20                    # 图层内楼群左缘、最高楼顶；CSS 再把图层右移 44px
PX, PY = 200, 130                             # 照片里楼群左缘、最高楼顶
K = 2                                         # 输出倍率
SIL, DETAIL = 10.0, 9.0                      # 剪影压暗量、细节强度（色阶）

p = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
r, g, b = p[..., 0], p[..., 1], p[..., 2]
L = p @ np.array([0.299, 0.587, 0.114], np.float32)
# 天空：偏蓝、局部平滑，且从上边缘连通（玻璃幕墙也偏蓝，但满是格线，不平滑、过不了这一关）
blue = (b > r + 0.12) & (b > g + 0.03)
mean = cv2.blur(L, (9, 9)); var = cv2.blur(L * L, (9, 9)) - mean * mean
cand = (blue & (var < 0.0004)).astype(np.uint8)
cand[560:] = 0
n, lab = cv2.connectedComponents(cand, connectivity=4)
top = set(np.unique(lab[0])) - {0}
sky = np.isin(lab, list(top)).astype(np.float32)
sky = cv2.morphologyEx(sky, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
sky = cv2.GaussianBlur(sky, (0, 0), 1.5)
detail = L - cv2.GaussianBlur(L, (0, 0), 6)
field = -SIL * (1 - sky) + DETAIL * detail * (1 - sky)

H1, W1 = 185, X1 - X0
cx = X0 + (np.arange(W1 * K) + 0.5) / K
cy = (np.arange(H1 * K) + 0.5) / K
MX, MY = np.meshgrid((PX + (cx - TOWER_X) / S).astype(np.float32), (PY + (cy - TOWER_Y) / S).astype(np.float32))
off = cv2.remap(field.astype(np.float32), MX, MY, cv2.INTER_AREA, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
X = np.broadcast_to(cx, off.shape)
Y = np.broadcast_to(cy[:, None], off.shape)
right_end = TOWER_X + (p.shape[1] - PX) * S
smooth = lambda t: np.clip(t, 0, 1) ** 2 * (3 - 2 * np.clip(t, 0, 1))
mask = smooth((X - X0) / 140) * smooth((right_end - X) / 160)
img = BASE + (off * mask)[..., None]
img = np.clip(np.round(img), 0, 255).astype(np.uint8)
Image.fromarray(img).save(out, quality=88, method=6)
print('layer', img.shape, 'right end', round(right_end, 1))
