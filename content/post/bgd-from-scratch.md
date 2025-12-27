---
title: "用Numpy实现批量梯度下降(BGD)"
description: ""
date: 2025-12-28T16:19:44+08:00
preview: ""
draft: false
tags: ['Numpy', '线性回归', '批量梯度下降', '机器学习']
categories: ['深度学习与实践']
image: https://cdn.nodeimage.com/i/AsX3ZTmQ8P1DY9sEou1frBlkpuhtbaMA.webp
---

## 0x01 前言

本文中你将看到: 辱骂老登, 逆天实验, 从零手搓,

## 0x02 什么叫作这是你们的Python实验?

一日主播正在摸鱼，突然收到朋友发来的一份Python实验报告的*拍屏*，遂点开阅读。  
读完之后主播受到大量惊吓，为分享与为辱骂对方教师提供证据，特此节选一段:  

> 实验名称：机器学习中线性回归的Python实现  
> ...  
> 线性回归表达式: \(Y = \theta_1X_1 + \theta_2X_2 + ... + \theta_nX_n + \theta_0\)  
> 训练模型求解线性回归系数 \(\theta_1, \theta_2, \theta_3\).

*似乎很简单，对吧?*  


但是据朋友表示，除了线性代数之外，没有任何有关内容的学习与铺垫，包括但不限于:  

- 机器学习  
- 概率论与数理统计  
- torch, numpy等一系列常用包的使用

等等.jpg

究竟是哪门子\*\*老师会去给学生布置这种邪门实验啊？？  
这还是Python课吗.jpg  

## 0x03 来都来了

### 拆解BGD

毕竟实验报告上给出来的就只有BGD本体，那自然而然就得先理解一下这是个啥鬼东西了。  
BGD的武魂真身：  

\[
\theta_j := \theta_j - \alpha \frac{1}{m} \sum_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) x_j^{(i)}
\]

那么这些鬼东西都是些啥:  

- \(\theta_j\): 参数，在这里就是线性回归的三个回归参数（aka 权重)
- \(\alpha\): 学习率
- \(m\): 样本数量
- \(h_\theta(x^{(i)})\): 预测值
- \(y^{(i)}\): 真实值
- \(x_j^{(i)}\): 第i个样本的第j个特征

### 那它是怎么实现拟合的呢?

本质上它的目的就是为了让预测结果和真实结果接近，也就是最小化预测结果与真实结果的差值，进而逼近原始的回归参数。  
既然要最小化预测结果与真实结果的差值，那从直觉上就知道我们要最小化 \(\theta x^ - y\) 了，更准确来说，其实是距离最近。
所以其实应该是平方，对于题目给出的三变量而言，自然就是
\((\theta_1x_1 + \theta_2x_2 + \theta_3x_3 - y)^2\)。  
可我们要动的是\(\theta\)，X和y都是固定的，那咋办呢？

### 代价函数 Cost Function

那我们可不可以给\(\theta\)来打个分呢？自然是可以的！

不妨定义一个代价函数\(J(\theta) = \frac{1}{2m} \sum_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)})^2\)，其中
\(h_\theta(x^{(i)})\)为预测值，\(y^{(i)}\)为真实值，\(m\)为样本数量。（如果有人看出来了，是的，这就是MSE在整个batch上的表示）

为什么要除m呢？因为我们求的是在每一个样本上\(\theta\)的代价。  
为什么要再乘\(\frac{1}{2}\)呢？因为之后求导很方便（x. (平方会刚好被消去，导完之后方便不少)

### 梯度与偏导

*虽然我们知道了什么是代价函数，换句话来说，知道了我们预测的好坏，可我们还是不知道怎么更新呀！*  
还记得高中的好朋友导数吗？它有个大哥叫作偏导.jpg  
既然我们的目的是最小化\(J(\theta)\)，那干嘛不直接给它求个导（因为是多元函数，在这里是偏导）呢？  

我们都知道，当一个函数的导数为0，就代表它达到了极值点，而对于这种函数来说(二次函数，开口向上)，我们可以放心的知道，当梯度为0的时候，我们到达的**一定是极小值点**（实际上也是最小值点）。
而直接解\(\frac{\partial J(\theta)}{\partial \theta} = 0\)是无法得到\(\theta\)的，况且解它难度也不小。  
而我们已经知道它的导数了，那我们不如直接减去它，如果导数是正的，在图上减去它就代表向左走；而如果导数是负的，减去它就代表向右走，反方向走，自然就能到达极值点。

### 一次下降多少?

既然我们已经知道要怎么走了，那走多少呢？这时候就有了学习率\(\alpha\)。  
它来决定一步走多远，如果\(\alpha\)越大，走的就越远，反之亦然。
自然，如果\(\alpha\)过小，走的就太慢，太阳下山了，你还在半山腰；  
如果\(\alpha\)过大，走的就太快，容易扯着蛋，跑到另一头去，搞不好下一脚可能又走回来，甚至跑得更远。
这就变成了在山谷两边反复横跳，永远也落不到底。

### 回到BGD

让我们对代价函数\(J(\theta)\)，对每个\(\theta_j\)求偏导：  
\[
    \frac{\partial J(\theta)}{\partial \theta_j} = \frac{1}{m} \sum_{i=1}^{m} (h_\theta(x^{(i)}) - y^{(i)}) x_j^{(i)}
\]

挺熟悉的？你再看看BGD呢.jpg  
实际上它就是BGD的梯度部分，也就是 Batch **Gradient** Descent 的 **Gradient**。
而前面的求和和除以m，就是BGD的**Batch**了。  
那 **Descent** 呢？自然就是\(\theta_j := \theta_j - \alpha \)的部分了。

## 0x04 那怎么写呢?

在计算机的世界里，我们一直都在跟向量和矩阵打交道，而手写for循环拆解自然慢的发指。不过我们还有numpy!  
我们大可以一条条处理再汇总，但是为什么不写成矩阵呢？  
于是乎对于我们提到的预测值，输入自然可以变成一个\(m \times 3 \)的矩阵，输出自然就是一个\(m \times 1 \)的矩阵，
而真实值就会是一个\(m \times 1 \)的矩阵，\(\theta\)则是一个\(3 \times 1 \)的矩阵。

在 Python 里，`nupy.dot()` 或者 `@` 都可以帮我们实现矩阵乘法，因此我们有:
{{< highlight python >}}
def predict(X, theta):
    return np.dot(X, theta)
{{< /highlight >}}

误差则直接可以通过`error = predict(X, theta) - y`来计算，梯度就会变成`gradients = X.T @ error / m`。  
*为什么是`X.T`? 线性代数告诉我们，一个\(m \times 3\)的矩阵是没法和\(m \times 1\)的矩阵相乘的，自然就需要进行转置，因此是`X.T`。*
更新权重就很简单了，`theta = theta - alpha * gradients`。

剩下的内容就很简单了，写一个循环把它们包起来就好，毕竟只优化一次也没什么用。

{{< highlight python >}}
def bgd(X, y, theta, alpha, num_iters):
    for i in range(num_iters):
        error = predict(X, theta) - y
        gradients = X.T @ error / m
        theta = theta - alpha * gradients
    return theta
{{< /highlight >}}

## 0x05 一些善后工作

回到实验报告，老登很贴心的不提供数据集，于是乎只好自己动手丰衣足食，来生成一组，顺便把\(\theta\)和学习率与迭代步数也初始化一下:

{{< highlight python >}}
import numpy as np
import matplotlib.pyplot as plt

true_theta = np.random.randn(3, 1)
X = np.random.randn(100, 3)
y = X @ true_theta

theta = np.zeros((3, 1))
alpha = 1e-2
num_iters = 800
{{< /highlight >}}

组合起来，就变成了
{{< highlight python >}}
true_theta = np.random.randn(3, 1)
X = np.random.randn(100, 3)
y = X @ true_theta

theta = np.zeros((3, 1))
alpha = 1e-2
num_iters = 100

cost = []

for i in range(num_iters):
    error = predict(X, theta) - y
    gradients = X.T @ error / m
    theta = theta - alpha * gradients
    cost.append(np.mean(error ** 2))

print("true theta", true_theta)
print("learned theta", theta)
plt.plot(cost)
plt.show()
{{< /highlight >}}

```text
theta: [[-0.53657517]
 [ 0.90257013]
 [-0.05914561]]
true_theta: [[-0.53695188]
 [ 0.90310105]
 [-0.06005814]]
```

![cost 函数的图](https://cdn.nodeimage.com/i/nFnSfWYtK4TyfeHrngO5oWB0Nz8ikeW0.webp)