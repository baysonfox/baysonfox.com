---
author: "baysonfox"
title: "用 AVIF 和 AV1 压缩 Cosplay 图库的体积"
date: "2024-06-19"
draft: false
tags: ['AVIF', 'AV1', 'Cosplay']
categories: ['折腾']
slug: avif-av1-cosplay-compress
image: https://img30.360buyimg.com/img/jfs/t20270817/242001/17/15436/39082/66c09017F03027e81/d726acbc1a6a2584.png.avif
---

编辑历史:  

- 2024/06/29 更新 AV1 部分调参内容

---

## 事出必有因

前几天闲来无事，于是打算看下自己的 Cosplay 收藏有多少，遂`du -sh`，结果如下:  
![Cosplay文件夹占用了354G的储存空间](https://img30.360buyimg.com/img/jfs/t20270817/226766/37/23285/23993/66c0a3f3Fb9c4ca77/db8ba79127a8f4c8.png.avif)  
**这可不好.jpg**  
于是点进去准备一探究竟，看看图片有多吃空间:  
![图片的大小](https://img30.360buyimg.com/img/jfs/t20270817/243652/15/14618/18199/66c0a84aFdf651670/15b6fa6711eaad18.png.avif)  
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

{{< highlight shell >}}
avifenc --min 0 --max 63 -a end-usage=q -a cq-level=18 -a tune=ssim \  
-a deltaq-mode=3 -a sharpness=3 -y 420 --jobs 8 --ignore-exif --ignore-xmp Coser-***.jpg Coser-***.avif
{{< / highlight >}}

至于为什么是这么个参数，原文是这么说的：  
> Note: "--min 0 --max 63 -a end-usage=q -a cq-level=18 -a tune=ssim" are the recommended settings for AVIF images.  

而`--ignore-exif --ignore-xmp` 为的是尽可能减小文件体积，反正 Exif 和 XMP 大概率都没啥用。

{{< toggle "结果：">}}

{{< highlight text>}}
Successfully loaded: Coser-***.jpg
AVIF to be written: (Lossy)

- Resolution     : 7952x5304
- Bit Depth      : 8
- Format         : YUV420
- Chroma Sam. Pos: 0
- Alpha          : Absent
- Range          : Full
- Color Primaries: 2
- Transfer Char. : 2
- Matrix Coeffs. : 6
- ICC Profile    : Present (3144 bytes)
- XMP Metadata   : Absent
- Exif Metadata  : Absent
- Transformations: None
- Progressive    : Unavailable
Encoding with AV1 codec 'aom' speed [6], color quality [51 (Medium)],
    alpha quality [100 (Lossless)], tileRowsLog2 [0], tileColsLog2 [0],
    8 worker thread(s), please wait...
Encoded successfully.
- Color AV1 total size: 1334940 bytes
- Alpha AV1 total size: 0 bytes
Wrote AVIF: Coser-***.avif
{{< / highlight >}}

{{< /toggle >}}

再看看图片大小(下方为原图):  
![JPEG格式的原图和AVIF格式下的图片大小对比](https://img30.360buyimg.com/img/jfs/t20270817/21356/16/22964/15080/66c0a881F512aa315/7665e05258bcafd2.png.avif)  
**效果立竿见影**  
93%的压缩率，很难不觉得 AVIF 不香。

随便写个小脚本:

{{< highlight shell >}}
for file in *.{jpg,JPG};
do avifenc --min 0 --max 63 -a end-usage=q -a cq-level=18 -a tune=ssim \
    -a deltaq-mode=3 -a sharpness=3 -y 420 --jobs 10 \
    --ignore-exif --ignore-xmp $file ${file%*.*}.avif;
done
{{< / highlight >}}
  
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

{{< highlight shell >}}
for video in *;
do ffmpeg -i $video -c:v libsvtav1 -preset 10 -crf 38 \
    -svtav1-params input-depth=10:tune=2:enable-qm=1:qm-min=0:keyint=300 \
    -c:a copy -threads 10 ${video%*.*}-av1.mp4;
done
{{< / highlight >}}

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

## 技术细节:视频下的 AV1 编码调参

`ffmpeg` 作为老牌的音视频处理瑞士军刀，配合 SVT-AV1 ，可供调整的编码参数多了不是一点半点，搞得人晕头转向（  
在此额外参考了 [Comparing SVT-AV1 Presets: Size, Quality, and Speed with CRF Variations](https://ottverse.com/analysis-of-svt-av1-presets-and-crf-values/)，文中对 SVT-AV1 编码器在不同预设和crf下的编码性能与质量进行了实验。  

略过文中的测试方法，直接看结论：  
编码性能（以 FPS 衡量）:  
![在 crf 和预设不同情况下的编码速度(按照 FPS 标准)](https://img30.360buyimg.com/img/jfs/t20270817/67251/39/26337/491422/66c0a89aF1d3a7827/d9ff25216cd40b02.png.avif)

编码质量(SSIM):  
![编码质量（SSIM）标准](https://img30.360buyimg.com/img/jfs/t20270817/232809/38/24657/444827/66c0a8b1Fd050d1fa/40903af01044ebcd.png.avif)  
PSNR:  
![编码质量（PSNR）标准](https://img30.360buyimg.com/img/jfs/t20270817/53442/8/25771/476992/66c0a8d6Fb0cfcaad/73e2f10f690ad7c3.png.avif)  
VMAF:
![编码质量（VMAF）标准](https://img30.360buyimg.com/img/jfs/t20270817/20132/6/22579/462606/66c0a952F9af27057/d32e5fdeb9139398.png.avif)

由图可知，所使用的preset与crf (`-preset 10 -crf 38`) 下,SSIM 与 PSNR 都与较低预设值和较低 crf 的对应参数区别不大，编码速度也落在了比较舒适的范围，因此使用此参数。  
事实上，根据原文作者的结论，似乎`-preset 12 -crf 38`与`-preset 2`的视频参数似乎区别不大，但是速度提升了135倍，完全可以直接无脑冲……？  

### 用数据说话

为了更贴合实际，又找了个 Cosplay 的图包里的视频进行实验:  
实验工具:

1. FFmpeg 7.0.1, built with Apple Clang version 15.0.0
2. SVT-AV1 Encoder Lib v2.1.1, built with Apple LLVM 15.0.0

实验步骤:

1. 把编码的 preset 固定为 N, N∈[0,12], 步长为1
2. 将编码所用 crf 设置为 20~63, 步长为6
3. 对每个编码结果，测量 VMAF、SSIM与PSNR.

实验结果:

{{< chart >}}
{
  type: 'line',
  options: {
    plugins: {
        title: {
            text: "CRF-VMAF, VMAF值",
            display: true
        }
    }
    },
  data: {
      labels: [
        '20',
        '26',
        '32',
        '38',
        '44',
        '50',
        '56',
        '62'
      ],
    datasets: [
{
    label:"preset-5",
    data: [93.475, 93.128, 92.17, 90.777, 88.758, 86.427, 83.058, 75.349]
},
{
    label:"preset-6",
    data: [92.086, 92.081, 91.272, 89.904, 87.845, 85.251, 81.782, 73.534]
},
{
    label:"preset-7",
    data: [92.086, 92.082, 91.27, 89.9, 87.852, 85.254, 81.785, 73.539]
},
{
    label:"preset-8",
    data: [90.99, 91.079, 90.229, 88.937, 87.13, 84.8, 81.234, 71.915]
},
{
    label:"preset-9",
    data: [89.631, 89.558, 88.786, 87.568, 86.115, 83.945, 80.573, 71.412]
},
{
    label:"preset-10",
    data: [91.699, 90.679, 89.071, 87.069, 84.752, 82.1, 77.809, 67.244]
},
{
    label:"preset-11",
    data: [93.062, 91.657, 89.6, 86.905, 83.687, 80.008, 74.506, 61.702]
},
{
    label:"preset-12",
    data: [92.344, 90.801, 88.484, 85.689, 82.733, 79.0, 73.513, 59.816]
},
    ]
  },
}
{{< /chart >}}


{{< chart >}}
{
  type: 'line',
  options: {
    plugins: {
        title: {
            text: "CRF-SSIM, SSIM值",
            display: true
        }
    }
    },
  data: {
      labels: [
        '20',
        '26',
        '32',
        '38',
        '44',
        '50',
        '56',
        '62'
      ],
    datasets: [
{
    label:"preset-5",
    data: [0.994, 0.994, 0.993, 0.993, 0.992, 0.991, 0.99, 0.986]
},
{
    label:"preset-6",
    data: [0.994, 0.994, 0.993, 0.992, 0.992, 0.991, 0.989, 0.985]
},
{
    label:"preset-7",
    data: [0.994, 0.994, 0.993, 0.992, 0.992, 0.991, 0.989, 0.985]
},
{
    label:"preset-8",
    data: [0.993, 0.993, 0.993, 0.992, 0.991, 0.99, 0.989, 0.984]
},
{
    label:"preset-9",
    data: [0.993, 0.993, 0.992, 0.991, 0.991, 0.99, 0.988, 0.984]
},
{
    label:"preset-10",
    data: [0.993, 0.992, 0.992, 0.991, 0.99, 0.989, 0.987, 0.981]
},
{
    label:"preset-11",
    data: [0.993, 0.992, 0.992, 0.991, 0.989, 0.987, 0.985, 0.979]
},
{
    label:"preset-12",
    data: [0.993, 0.992, 0.991, 0.99, 0.989, 0.988, 0.985, 0.979]
}
    ]
  },
}
{{< /chart >}}


{{< chart >}}
{
  type: 'line',
  options: {
    plugins: {
        title: {
            text: "CRF-PSNR, PSNR值",
            display: true
        }
    }
    },
  data: {
      labels: [
        '20',
        '26',
        '32',
        '38',
        '44',
        '50',
        '56',
        '62'
      ],
    datasets: [
{
    label:"preset-5",
    data: [50.142, 49.879, 49.337, 48.747, 47.973, 47.195, 46.116, 44.255]
},
{
    label:"preset-6",
    data: [49.636, 49.536, 49.054, 48.482, 47.702, 46.88, 45.807, 43.888]
},
{
    label:"preset-7",
    data: [49.638, 49.531, 49.057, 48.485, 47.698, 46.879, 45.806, 43.887]
},
{
    label:"preset-8",
    data: [48.94, 49.02, 48.556, 48.013, 47.317, 46.568, 45.563, 43.449]
},
{
    label:"preset-9",
    data: [48.132, 48.231, 47.89, 47.431, 46.966, 46.29, 45.362, 43.323]
},
{
    label:"preset-10",
    data: [48.996, 48.629, 48.038, 47.332, 46.652, 45.889, 44.761, 42.599]
},
{
    label:"preset-11",
    data: [49.545, 48.923, 48.119, 47.265, 46.26, 45.334, 44.067, 41.741]
},
{
    label:"preset-12",
    data: [49.146, 48.475, 47.618, 46.773, 45.967, 45.085, 43.996, 41.66]
}
    ]
  },
}
{{< /chart >}}

{{< chart >}}
{
  type: 'line',
  options: {
    plugins: {
        title: {
            text: "Preset-VMAF, VMAF值",
            display: true
        }
    }
    },
  data: {
      labels: [
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12'
      ],
    datasets: [
{
    label:"crf-20",
    data: [93.475, 92.086, 92.086, 90.99, 89.631, 91.699, 93.062, 92.344]
},
{
    label:"crf-26",
    data: [93.128, 92.081, 92.082, 91.079, 89.558, 90.679, 91.657, 90.801]
},
{
    label:"crf-32",
    data: [92.17, 91.272, 91.27, 90.229, 88.786, 89.071, 89.6, 88.484]
},
{
    label:"crf-38",
    data: [90.777, 89.904, 89.9, 88.937, 87.568, 87.069, 86.905, 85.689]
},
{
    label:"crf-44",
    data: [88.758, 87.845, 87.852, 87.13, 86.115, 84.752, 83.687, 82.733]
},
{
    label:"crf-50",
    data: [86.427, 85.251, 85.254, 84.8, 83.945, 82.1, 80.008, 79.0]
},
{
    label:"crf-56",
    data: [83.058, 81.782, 81.785, 81.234, 80.573, 77.809, 74.506, 73.513]
}
    ]
  },
}
{{< /chart >}}

{{< chart >}}
{
  type: 'line',
  options: {
    plugins: {
        title: {
            text: "Preset-SSIM, SSIM值",
            display: true
        }
    }
    },
  data: {
      labels: [
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12'
      ],
    datasets: [
{
    label:"crf-20",
    data: [0.994, 0.994, 0.994, 0.993, 0.993, 0.993, 0.993, 0.993]
},
{
    label:"crf-26",
    data: [0.994, 0.994, 0.994, 0.993, 0.993, 0.992, 0.992, 0.992]
},
{
    label:"crf-32",
    data: [0.993, 0.993, 0.993, 0.993, 0.992, 0.992, 0.992, 0.991]
},
{
    label:"crf-38",
    data: [0.993, 0.992, 0.992, 0.992, 0.991, 0.991, 0.991, 0.99]
},
{
    label:"crf-44",
    data: [0.992, 0.992, 0.992, 0.991, 0.991, 0.99, 0.989, 0.989]
},
{
    label:"crf-50",
    data: [0.991, 0.991, 0.991, 0.99, 0.99, 0.989, 0.987, 0.988]
},
{
    label:"crf-56",
    data: [0.99, 0.989, 0.989, 0.989, 0.988, 0.987, 0.985, 0.985]
}
    ]
  },
}
{{< /chart >}}

{{< chart >}}
{
  type: 'line',
  options: {
    plugins: {
        title: {
            text: "Preset-PSNR, PSNR值",
            display: true
        }
    }
    },
  data: {
      labels: [
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12'
      ],
    datasets: [
{
    label:"crf-20",
    data: [50.142, 49.636, 49.638, 48.94, 48.132, 48.996, 49.545, 49.146]
},
{
    label:"crf-26",
    data: [49.879, 49.536, 49.531, 49.02, 48.231, 48.629, 48.923, 48.475]
},
{
    label:"crf-32",
    data: [49.337, 49.054, 49.057, 48.556, 47.89, 48.038, 48.119, 47.618]
},
{
    label:"crf-38",
    data: [48.747, 48.482, 48.485, 48.013, 47.431, 47.332, 47.265, 46.773]
},
{
    label:"crf-44",
    data: [47.973, 47.702, 47.698, 47.317, 46.966, 46.652, 46.26, 45.967]
},
{
    label:"crf-50",
    data: [47.195, 46.88, 46.879, 46.568, 46.29, 45.889, 45.334, 45.085]
},
{
    label:"crf-56",
    data: [46.116, 45.807, 45.806, 45.563, 45.362, 44.761, 44.067, 43.996]
}
    ]
  },
}
{{< /chart >}}

### 那么，结论是

在编码速率和编码质量来看，`-preset 10 -crf 38`的参数的确符合了要求，也没有产生视觉上的瑕疵，与上文的结论一致。  
