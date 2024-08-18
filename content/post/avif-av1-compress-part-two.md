---
author: "baysonfox"
title: "AV1 的奇妙之旅: Part 2"
date: "2024-08-18"
draft: false
tags: ['AVIF', 'AV1', '视频编码' , '图像编码', 'Python']
categories: ['折腾']
slug: avif-av1-compress-part-two
image: https://img30.360buyimg.com/img/jfs/t20270818/108923/20/51337/21774/66c0d894F34b74770/737acc2a60d4a0e1.jpg.avif
---

## 前情提要

在[上一篇文章](https://baysonfox.com/2024/06/19/avif-av1-cosplay-compress/)里，我们初步的为了~~赶潮流~~ ~~折腾~~ 宝贵的储存空间而决定投奔 AV1 编码之后，又过了那么个把月。这个把月自然是没有闲着，依然在捉摸着如何优化编码流程和效率。  

## Python 加入战场

最开始的编码脚本完全基于一行 bash，不仅很蠢，也很容易出 bug（比如说带空格和特殊符号的文件），更没法搞定文件夹里的文件。  
虽然大部分痛点可以用 find 和 xargs 之类的操作解决，但还是不够优雅，加之我也不习惯写 bash script，Python 还算是我的心头好，于是便用 Python 实现了一遍它的功能。  

代码如下:  
{{<highlight python>}}
import os
import subprocess
import ffmpeg
import shlex
from utils import get_keyint, get_video_resolution, get_tiles, return_path, get_img_size

path = os.getcwd()
path = os.path.join(path, 'todo/')
video_extension = ('.mp4', '.MP4', '.MOV', '.mov')
image_extension = ('.jpg', '.JPG', '.png', '.PNG', '.jpeg')

video_files = []
image_files = []
log_lines = []

for root, dirs, files in os.walk(path):
    for file in files:
        if file.endswith(video_extension):
            video_files.append(os.path.join(root, file))
        if file.endswith(image_extension):
            image_files.append(os.path.join(root, file))
            
for file in video_files:
    new_path = return_path(file, 'video')
    keyint = get_keyint(file)
    w, h = get_video_resolution(file)
    rows, columns = get_tiles(w, h)
    ffmpeg_cmd = (
        ffmpeg
        .input(file)
        .output(
            new_path,
            vcodec="libsvtav1",
            acodec="copy",
            preset=10,
            crf=40,
            threads=10,
            **{"svtav1-params":"input-depth=10:tune=3:enable-qm=1:qm-min=0:enable-dlf=2:sc-pix-format=yuv420p:keyint={}:tile-rows={}:tile-columns={}".format(keyint, rows, columns)}
        )
        .run(overwrite_output=True)
    )

for file in image_files:
    new_path = return_path(file, 'image')
    w, h = get_img_size(file)
    rows, columns = get_tiles(w, h)
    avifenc_cmd = """
        avifenc \
        --min 0 --max 63 \
        -a enable-chroma-deltaq=1 \
        --autotiling \
        -a quant-b-adapt=1 \
        -a sb-size=64 \
        -a tune=ssim \
        -a deltaq-mode=2 \
        -a row-mt=0 \
        -a cpu-used=4 \
        -a tune-content=psy \
        --jobs 8 -s 3 \
        -d 10 \
        {} {}
    """.format(shlex.quote(file), shlex.quote(new_path))

    subprocess.run(avifenc_cmd, shell=True)
{{</highlight>}}

不妨细细展开，先从比较简单的图片讲起。

### 图片处理

抛开各种有的没的的文件处理与各种东西，最重要的部分如下:  
{{<highlight python>}}
for file in image_files:
    new_path = return_path(file, 'image')
    w, h = get_img_size(file)
    rows, columns = get_tiles(w, h)
    avifenc_cmd = """
        avifenc \
        --min 0 --max 63 \
        -a enable-chroma-deltaq=1 \
        -a enable-qm=0 \
        --autotiling \
        -a quant-b-adapt=1 \
        -a sb-size=64 \
        -a tune=ssim \
        -a deltaq-mode=2 \
        -a cpu-used=4 \
        -a tune-content=psy \
        --jobs 8 -s 3 \
        -d 10 \
        {} {}
    """.format(shlex.quote(file), shlex.quote(new_path))
{{</highlight>}}

流程分解:  

1. 获取图片的分辨率  
2. 用 `avifenc` 编码 (最终依然会回到 `aomenc`)

*看着很简单，对吧？* 因为它确实很简单。重点在 `avifenc_cmd` 的那一坨参数上，这帮鬼东西占据了我这段时间的相当一部分精力。  

让我们再次一行行展开：
*注：所有以 "-a" 开头的参数全部会被直接传到 aomenc，因此在后面不再特地强调 "-a" 本身。*

1. `--min 0 --max 63`:  这俩参数其实没啥好说的，单纯限制一下颜色量化，实测下能在肉眼难以辨别的情况下比较有效的减小文件体积。  
2. `enable-chroma-deltaq=1`: 它和下面的`enable-qm=0`这俩参数就比较有意思了，更多属于偏经验主义，似乎会比一般情况下快不少……？  
3. `enable-qm=0`: 官方文档中特别提到了 "default is 0 for allintra mode, 1 for good and realtime modes"，对于视频编码来说将它设置为 1 会更好，但对于图片这种 allintra （即全部为关键帧）的情况来说，可以设置为0.  
4. `tune=ssim`: 先暂时跳过中间的参数，放到后面再讲，就本质上来说`tune=ssim`能够相比`psnr`做到更好的针对画质优化。  
5. `--jobs 8 -s 3`: 设置8线程编码，speed 为 3. (speed 为 0-10, 越低越慢，质量越好)
6. `-d 10`: 本质上也是半经验主义参数。手动设置输入为 10bit 可以有效减小 aomenc 里对各种参数计算时的取整操作，进一步提升编码效率。

至于其他的参数，都基本源于在 Discord 的一场讨论：  
![202408181207736](https://img30.360buyimg.com/img/jfs/t20270818/47540/28/26065/97381/66c17375F35619f22/59c5451855888877.png.avif)
![CleanShot 2024-08-18 at 12.07.42@2x](https://img30.360buyimg.com/img/jfs/t20270818/242413/6/15259/355499/66c17399F6e3d545d/d9f0ed68f89dc22e.png.avif)
![CleanShot 2024-08-18 at 12.08.06@2x](https://img30.360buyimg.com/img/jfs/t20270818/232894/6/23322/518442/66c173b4F0b8e843c/c2bc6ca797ce05cd.png.avif)

太长不看版:  `--autotiling --quant-b-adapt=1 --sb-size=64 --deltaq-mode=2 --cpu-used=4 --tune-content=psy`.  
TODO: 对这几个参数的详细解释  

### 视频处理

同样，上代码：  
{{<highlight python>}}
for file in video_files:
    new_path = return_path(file, 'video')
    keyint = get_keyint(file)
    w, h = get_video_resolution(file)
    rows, columns = get_tiles(w, h)
    ffmpeg_cmd = (
        ffmpeg
        .input(file)
        .output(
            new_path,
            vcodec="libsvtav1",
            acodec="copy",
            preset=10,
            crf=40,
            threads=10,
            **{"svtav1-params":"input-depth=10:tune=3:enable-qm=1:qm-min=0:enable-dlf=2:keyint={}:tile-rows={}:tile-columns={}".format(keyint, rows, columns)}
        )
        .run(overwrite_output=True)
    )
{{</highlight>}}

视频的编码流程就会相对复杂一些，首先用 `keyint` 得到关键帧间隔（帧率*10）, 再用`get_video_resolution`和`get_tiles`获取`tile-rows`和`tile-columns`（本质上和图片部分的`--autotiling`）是一样的。  

其他参数就和图片部分没啥大差别了，但还是要特别提及一下`tune=3`: 在默认的 SVT-AV1 下是不存在 `tune=3` 的设置的，只存在`tune=2`（即SSIM），这里我使用了 [SVT-AV1-PSY](https://github.com/gianni-rosato/svt-av1-psy), 额外添加了SSIM with Subjective Quality Tuning作为`tune=3`，更好改善画质.  

我所用到的 Python 脚本也都上传到了GitHub: [https://github.com/baysonfox/avif-compression](https://github.com/baysonfox/avif-compression)