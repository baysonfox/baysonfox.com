---
title: 用 AVIF 和 AV1 压缩 Cosplay 图库的体积
description: ""
date: 2024-06-19T14:30:22.971Z
preview: ""
draft: false
tags: ['AVIF', 'AV1', 'Cosplay']
categories: ['折腾']
type: default
slug: avif-av1-cosplay-compress
image: https://p0.meituan.net/csc/1a37138365cc6b426bb2cc9d498d68df36910.png@1e_1c.webp
---

## 事出必有因

前几天闲来无事，于是打算看下自己的 Cosplay 收藏有多少，遂`du -sh`，结果如下:  
![Cosplay文件夹占用了354G的储存空间](https://p1.meituan.net/csc/a847f8ee9df9c0d2134779a11d2f1ceb25079.png@1e_1c.webp)  
**这可不好.jpg**  
于是点进去准备一探究竟，看看图片有多吃空间:  
![图片的大小](https://p0.meituan.net/csc/f7386896af3ddc413f6c0e5093b436ef18258.png@1e_1c.webp)  
这能忍？开干！

## 那咋整呢？

摆在面前的有三种选择：

- JPEG XL
- AVIF
- WebP

于是查阅互联网，找到一篇来自 [Moonvy 月维](https://moonvy.com) 的[文章](https://moonvy.com/blog/post/2022/next-generation-Image-format-2022/)。  
直接上结论:  
> AVIF 有损压缩效果最好，无损压缩非常糟糕。编码速度很慢。  
> JPEG XL 无损压缩效果最好，有损压缩较 AVIF 有些许差距。编码速度快。  
> WebP 2 无损压缩效果优秀，有损压缩的上限达到了 AVIF 的水平，但下限很低，不稳定。编码速度很慢。  
但是考虑到未来可能还有网页浏览的需求，再加上 WebP 2 本身就没法在我的林檎OS(也就是 macOS)上正常浏览，且可以接受一定程度的有损压缩，于是直接冲 AVIF。

## 支线任务: 装上 libavif

决定好要用 AVIF，但是系统里大概率没有`libavif`，于是先装再说。  
介于我用 macOS ，直觉便是`brew search avif`，`brew install libavif`，秒了。  
但是，古人曾言:  

> AVIF 是这样的。林檎用户只要无脑装`libavif`就可以，可是其他系统的用户要考虑的事就很多了。  

各路 Linux 玩家往这里看：[https://web.dev/articles/compress-images-avif](https://web.dev/articles/compress-images-avif)；  
至于 Windows ， *自求多福*。  

## AVIF, 启动

毕竟是尺度有那么一丢丢大的 Cosplay (真的只有一丢丢！)，所以没有对比图（  
处理用的命令如下：  

```shell
avifenc --min 0 --max 63 -a end-usage=q -a cq-level=18 -a tune=ssim \  
-a deltaq-mode=3 -a sharpness=3 -y 420 --jobs 8 --ignore-exif --ignore-xmp Coser-***.jpg Coser-***.avif
```

至于为什么是这么个参数，原文是这么说的：  
> Note: "--min 0 --max 63 -a end-usage=q -a cq-level=18 -a tune=ssim" are the recommended settings for AVIF images.  

而`--ignore-exif --ignore-xmp` 为的是尽可能减小文件体积，反正 Exif 和 XMP 大概率都没啥用。

{{< toggle "结果：">}}

```text
Successfully loaded: Coser-***.jpg
AVIF to be written: (Lossy)
 * Resolution     : 7952x5304
 * Bit Depth      : 8
 * Format         : YUV420
 * Chroma Sam. Pos: 0
 * Alpha          : Absent
 * Range          : Full
 * Color Primaries: 2
 * Transfer Char. : 2
 * Matrix Coeffs. : 6
 * ICC Profile    : Present (3144 bytes)
 * XMP Metadata   : Absent
 * Exif Metadata  : Absent
 * Transformations: None
 * Progressive    : Unavailable
Encoding with AV1 codec 'aom' speed [6], color quality [51 (Medium)], 
    alpha quality [100 (Lossless)], tileRowsLog2 [0], tileColsLog2 [0], 
    8 worker thread(s), please wait...
Encoded successfully.
 * Color AV1 total size: 1334940 bytes
 * Alpha AV1 total size: 0 bytes
Wrote AVIF: Coser-***.avif
```

{{< /toggle >}}

再看看图片大小(下方为原图):  
![JPEG格式的原图和AVIF格式下的图片大小对比](https://p1.meituan.net/csc/64561a69b040f4823814c8e700c0df4114887.png@1e_1c.webp)  
**效果立竿见影**  
93%的压缩率，很难不觉得 AVIF 不香。

随便写个小脚本:

```shell
for file in *.{jpg,JPG};
do avifenc --min 0 --max 63 -a end-usage=q -a cq-level=18 -a tune=ssim \
    -a deltaq-mode=3 -a sharpness=3 -y 420 --jobs 8 \
    --ignore-exif --ignore-xmp $file ${file%*.*}.avif;
done
```
  
图片部分，堂堂结束！  

## 视频部分

那么…… **AV1 or HEVC?**

~~会出现这个问题本质上还是因为自己没有 N卡，不然直接硬件加速上AV1解决一切问题（~~  
当然，看标题就已经能够得出结论了：最后选了AV1。

**但为什么是 AV1 不是 HEVC？**
虽然 HEVC 在 macOS + ffmpeg 上有 hevc_videotoolbox 的硬件加速，但相较于 AV1(libsvtav1) 体积反而会来的更大些（但也不至于到无法忍受的地步）;  
且在同等画质水平(肉眼几乎无感, 姑且将其设定为SSIM ≥ 0.95)下体积表现很好。  

**AV1 软件编码不慢吗？**
慢是慢，但是在各种魔法参数的优化下(见下文)，ffmpeg 里速度表现还可以(4.45x)，虽然没有 HEVC 硬编快(8.24x)，但也不错。  
再加上并没有什么转码时间上的要求，AV1 在这种情况下还蛮香的。

于是乎，AV1 成了最终选择.  

同上，脚本如下:  

```shell
for video in *;
do ffmpeg -i $video -c:v libsvtav1 -preset 10 -crf 30 \
    -svtav1-params input-depth=10:tune=2:enable-qm=1:qm-min=0:keyint=300 \
    -c:a copy -threads 16 ${video%*.*}-av1.mp4;
done
```

具体参数不再赘述，在此附上参考文章：

- [https://wiki.x266.mov/docs/encoders/SVT-AV1#encoding](https://wiki.x266.mov/docs/encoders/SVT-AV1#encoding)
- [https://www.ffmpeg.org/ffmpeg-all.html#libsvtav1](https://www.ffmpeg.org/ffmpeg-all.html#libsvtav1)
- [https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md](https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Parameters.md)

TODO: 详细的文档记录& benchmarks (PSNR SSIM etc.)

## 最终结果

Cosplay 图库里的数据实在太多 根本压不完（  
这一部分等全部搞定之后再更新（  

更新：压完嘞（  
最后结果： 354G -> 64G  
82% 的空间优化，可喜可贺可喜可贺（
