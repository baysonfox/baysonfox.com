---
title: 在VSCode上使用配置文件
description: ""
date: 2024-07-09T16:37:40.044Z
preview: ""
draft: false
tags: ['VSCode', 'Python', 'Code Infrastructure']
categories: []
image: https://img30.360buyimg.com/img/jfs/t20270817/35830/29/23255/11392/66c0a9d7F58a21302/58c8f125dd2e6949.png.avif
---

## 前言

在使用配置文件之前，我机器上的 VSCode 可谓是插件大杂烩：各种为了不同文件格式的 Linter / Formatter 堆在一起，亦或是 Hugo 的各类实用工具让我找不着北，甚至拖慢启动速度，的确不能忍。  

作为多少有点开发环境“赛博洁癖”的一员，决定重新把自己的 VSCode 环境推倒重新来过，在此顺便记载一下过程。  

## 在 VSCode 上使用配置文件

为了更好的把各路适用于不同场景的插件彻底分开，曾经尝试过用 Workspace 做区分，对每一个文件夹（比如baysonfox.com的源代码和其他的个人项目，亦或是写的小工具脚本，就用上了配置文件。  

创建一个配置文件倒也很简单，在左下角的齿轮处就有一个配置文件的选单，直接从那里选择新建一个配置文件，再指定名称就好。  

![在 VSCode 上创建配置文件](https://img30.360buyimg.com/img/jfs/t20270817/58879/12/26267/34842/66c0a9feF8b61f101/5f66da6b55a142bb.png.avif)  

## Python 的配置文件：魔改官方

大体来讲，Python 的配置文件基本可以说是照抄 VSCode 的官方文档 [https://code.visualstudio.com/docs/editor/profiles#_profile-templates](https://code.visualstudio.com/docs/editor/profiles#_profile-templates) 里的 Data Science Profile Template 和 Python Profile Template，但我又根据自己的习惯（也以尽量精简化的角度考虑），进行了一些改动：

在 Python Profile Template 中，去掉了Docker, Even Better TOML 和 Black Formatter。 去掉 Docker 是因为我在写 Python 的时候并不会用到 Docker；
Even Better TOML 理由也几乎相同，我没有编辑 toml 的需求。而至于 Black Formatter，我所用到的功能无非只是一个格式化，也没有太强的格式需求，它的角色已经可以被 Ruff 完全替代，因此将其删除。  

在 Data Science Profile Template 中，我选择了里面的 Data Wrangler 与 Jypyter。不安装 Dev Containers 的理由同 Docker，而 GitHub Copilot 则暂时被 Codeium 取代（或许会等我搞到 GitHub 学生包之后再换回去）。  

习惯使然，主题方面我使用的是 Monokai Pro。

总结一下：在各种删删改改之后，我最终的插件列表如下:

1. autoDocstring (njpwerner.autodocstring)
2. Codeium (Codeium.codeium)
3. Data Wrangler (ms-toolsai.datawrangler)
4. Monokai Pro (monokai.theme-monokai-pro-vscode)
5. Pylance (ms-python.vscode-pylance)
6. Python (ms-python.python)
7. Python Environment Manager (donjayamanne.python-environment-manager)
8. Ruff (charliermarsh.ruff)

大部分插件基本上都是开箱即用，但是 Ruff 还需要额外进行一些配置，在打开的项目下新建一个 `ruff.toml`，在里面指定好需要的检查就好。  
（可参考 [https://blog.davidz.cn/post/aio-ruff](https://blog.davidz.cn/post/aio-ruff)。）

## Hugo 的配置文件：从零开始

我本以为我的配置文件会相当复杂，但插件反而比 Python 要少不少，大多数就只是 Markdown 和 Hugo 相关。  
直接上列表：

1. markdownlint (DavidAnson.vscode-markdownlint)
2. Hugo Language and Syntax Highlight (budparr.language-hugo-vscode)
3. Front Matter CMS (eliostruyf.vscode-front-matter)
4. hugofy (akmittal.hugofy)
5. Hugo Shortcode Syntax Highlight (kaellarkin.hugo-shortcode-syntax)

这些插件的主要作用都是改善 QoL (**Q**uality **o**f **L**ife) 的提升，markdownlint 负责格式，两个 Syntax Highlight 负责高亮，  
而 Front Matter CMS 的作用更像是一个在 VSCode 里的面板，便于直接管理文章，而不用在命令行里手敲`hugo new`创建文章。  

## 装模作样的结尾

差不多就是这样，~~又水了一篇 blog~~。虽然自从去年换了 M2 Pro 之后，VSCode 的启动速度都相当快，但还是对 VSCode 做了些优化与配置分离，毕竟各种插件混着放在一起，看的不仅心里不舒服，有时还会冲突打起架，搞得心烦意燥，改完之后终于舒服了些。
