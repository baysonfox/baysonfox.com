---
title: 使用MSVC和VSCode搭建C语言开发环境
description: ""
date: 2024-10-09T23:26:40.031Z
preview: ""
draft: false
tags: ['VSCode', 'C', 'Code Infrastructure']
categories: []
image: https://img30.360buyimg.com/img/jfs/t20271009/200262/3/45092/119332/6706967dF3a3731d0/812da67513989ad6.png.avif
---

## 温馨提示

1. 本文可以基本理解为对[https://code.visualstudio.com/docs/languages/cpp](https://code.visualstudio.com/docs/languages/cpp) 的直接翻译和部分精简, 如有条件可直接参考原文。  
2. 对CUIT学生：本文仅供参考，仅为其中一种在你的机器上设置一个基础的用于学习C语言以及相关课程的环境，实际上其他开发环境，比如Dev-C++，Visual Studio （如果你会用的话）都没问题.

## 安装 VSCode

1. 访问 [https://code.visualstudio.com](https://code.visualstudio.com), 点击"Download for Windows", 下载Visual Studio Code的安装包（注: 对CUIT的学生: 如果网络太差可以直接找我要）.
![下载VSCode](https://img30.360buyimg.com/img/jfs/t20271009/246518/22/19814/222162/67069829Fc3ea0894/3cd4347721bb6f5a.png.avif)
之后, 点击下载下来的安装包 (它的名字应该类似`VSCodeUserSetup-x86_64-1.94.1.exe`)，开始安装 (一路确认就好).

## 在 VSCode 里安装语言包和一些必要插件

打开Visual Studio Code后，映入眼帘的大概率是全英文界面.

1. 在左侧的Extensions面板（或者说左上角的几个图标里最底下那个长得很像几个方块的那个图标，或者直接用Ctrl + Shift + X 调出）里，搜索"Chinese", 点击第一个结果，安装&启用它。
2. 同样是在这个面板, 依次搜索 "C/C++ Extension Pack" 和 "Code Runner", 依次安装并启用它们。

第二步里安装的时候可能会提示很多东西，但暂时不需要理会它们。

## 安装MSYS2

1. 访问 [https://www.msys2.org](https://www.msys2.org), 在"Installation"标题下，点击"Download the installer"旁边的按钮，下载MSYS2的安装包(现在 (2024/10/9), 叫作`msys2-x86_64-20240727.exe` 同上，CUIT学生如果网络不好也可以找我要)
2. 打开之后也可以一路回车安装，安装耗时可能略久，但大部分情况下不会太久
3. 假设你没有特地更改选项，那么安装完成之后应该会自动弹出一个黑色窗口，如图所示：
![MSYS2 Default Window](https://img30.360buyimg.com/img/jfs/t20271009/191163/21/49007/3624/67069babFb7e1e489/86d9dd2985bd931b.png.avif)

4. 在弹出的窗口内, 输入`pacman -S --needed base-devel mingw-w64-x86_64-toolchain` （建议直接复制粘贴）, 在提示"Enter a selection (default=all)"时直接enter确认，待它自动安装.
5. 在安装结束之后（你发现你可以随便输入命令，且回车能出现结果后），输入`gcc -v`测试安装是否成功, 如果在底部附近出现了 `gcc version` 的字样，说明安装应该没有什么问题。

## 设置环境变量

1. 点击任务栏里的Windows图标, 输入"path", 选择 "编辑系统环境变量", 在弹出窗口内选择“环境变量”.
2. 在弹出窗口内的上半部分（"你的用户名" 的用户变量）处，双击名称为"Path"的项目，在弹出窗口内点击"新建", 输入"C:\msys64\ucrt64\bin"，点击确定保存. 

## 最终测试

1. 回到VSCode，新建文件，输入以下内容后按Ctrl + S 保存（建议直接复制粘贴）:

{{< highlight c >}}
#include <stdio.h>
int main() {
    printf("Hello World!");
    return 0;
}
{{</ highlight >}}
2. 在刚才的编辑窗口内，按下Ctrl + Alt + N (对macOS用户来说, Control + Option + N),如果自动弹出了一个窗口，并且有"[Running]" 和 "[Done]" 字样，说明你完事了.jpg

