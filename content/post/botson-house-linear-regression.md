---
title: "D2L: 用PyTorch和线性回归模型实现波士顿房价预测"
description: ""
date: 2024-10-17T14:26:40.031Z
preview: ""
draft: false
tags: ['PyTorch', '线性回归', 'Dive into Deep Learning', '深度学习']
categories: ['深度学习与实践']
image: https://img30.360buyimg.com/img/jfs/t20271017/103976/18/52205/48713/6710ada3Fc993bbae/0fd577987fa47b40.png.avif
---

## 前言

在大学选择人工智能专业以后，本来以为大一就会开始相关专业课的学习（框架，基础模型啥的），拿到大一上学期课程表一看，不能说是毫无关联，只能说是给其他人看都不知道你学人工智能.jpg  
既然学校决定不在大一上学期（甚至下学习）开始专业课的学习，那就只好自己丰衣足食，先下手为强（bushi  
P.S. 本文（以及后续可能有也可能没有的文章）基本上都是我在自己跟着[Dive into Deep Learning](https://zh.d2l.ai)的过程中的一些实验与记录，里面的很多内容或许看起来很傻，或许对部分人来说理所当然，近乎常识，但我不知道，所以决定写写。（希望我大二系统性学之后回来看不会觉得自己太傻（  

在看完[3.1. 线性回归](https://zh.d2l.ai/chapter_linear-networks/linear-regression.html)、[3.2. 线性回归的从零开始实现](https://zh.d2l.ai/chapter_linear-networks/linear-regression-scratch.html)和 [3.3. 线性回归的简洁实现](https://zh.d2l.ai/chapter_linear-networks/linear-regression-concise.html)后，~~突然感觉自己行了~~，再加上之前听说过的线性回归经典例子：波士顿房价预测，于是决定自己跟着试一试，反正流程大同小异，对吧（  

## 获取数据集

数据集的获取反倒相当简单，网络上哪哪都是（  
我使用的数据集是 Kaggle 上的 [Boston House Prices](https://www.kaggle.com/datasets/vikrishnan/boston-house-prices/data)，值得一提的是，这个数据集和经典版的数据集不太一样，**缺少"B"这一个Feature**。  
拉下来一看，经典csv.  

姑且还是把Features都说一说（也是为了水点字数）(翻译 by ChatGPT):

- CRIM: 每个镇的人均犯罪率
- ZN: 住宅用地比例，地块面积超过 25,000 平方英尺的比例
- INDUS: 每个镇的非零售商业用地比例
- CHAS: 查尔斯河虚拟变量（=1 表示地块毗邻河流；否则为 0）
- NOX: 氧化氮浓度（每 1000 万份中的份数）
- RM: 每个住宅的平均房间数
- AGE: 1940 年前建造的自有住房比例
- DIS: 到波士顿五个就业中心的加权距离
- RAD: 辐射公路的可达性指数
- TAX: 每 10,000 美元的全额物业税率
- PTRATIO: 每个镇的师生比例
- LSTAT: 低社会经济地位人口的百分比

## 读取并处理数据集

把数据集拉下来之后，多少要给它处理下，不然机器可看不懂（Code ahead）:  
先看看数据集长啥样:  

```python
data_csv = pd.read_csv("boston.csv")
data_csv.head()
```  

![First 5 samples of Boston House Prices dataset](https://img30.360buyimg.com/img/jfs/t20271017/237768/28/25873/78580/6710b33eFb8ab1ead/1894d886b2a2362c.png.avif)

之后便是对数据集进行处理，分出 Features 和 Labels ，顺便把训练集和测试集也分下。
P.S. 为了接下来行文方便，**刻意省略了部分代码**  

{{< highlight python >}}
# CRIM, ZN ... LSTAT -> features
# MEDV -> Labels
feature = data_csv.drop("MEDV", axis=1)
label = data_csv["MEDV"]

feature_tensor = torch.tensor(feature.values, dtype=torch.float32)
# Resizing the label tensor to corresponding size ([y] -> [y, 1])
label_tensor = torch.tensor(label.values, dtype=torch.float32).reshape(-1, 1)

# Create dataset
dataset = data.TensorDataset(feature_tensor, label_tensor)

# Train-Test split
train_size = int(0.8 * len(dataset))
test_size = len(dataset) - train_size
train_dataset, test_dataset = data.random_split(dataset, [train_size, test_size])

train_iter = data.DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
test_iter = data.DataLoader(test_dataset, batch_size=batch_size, shuffle=True)
{{</ highlight >}}

上面这段干的事其实很简单：

1. 先把 MEDV 给忽略掉，把 Features 单独提出来，再单独把 MEDV 提出来当 Labels.
2. 把`feature`转换成张量`feature_tensor`，方便接下来处理。
3. 同样，把`label`转换成张量`label_tensor`，但再`.reshape`，给它的大小变成(-1, 1)，不然`torch`回头会爆警告。
4. 用`feature_tensor`, `label_tensor` 创建一个叫作`dataset`的`TensorDataset`。
5. 把训练集和测试集分开。

## 定义一个线性回归模型，初始化权重

在这里使用`nn.Sequential`和`nn.Linear`来创建模型.  
引用一下D2L中对它们的描述:  

> Sequential类将多个层串联在一起。 当给定输入数据时，Sequential实例将数据传入到第一层， 然后将第一层的输出作为第二层的输入，以此类推。  
> 在PyTorch中，全连接层在Linear类中定义。 值得注意的是，我们将两个参数传递到nn.Linear中。 第一个指定输入特征形状，第二个指定输出特征形状，输出特征形状为单个标量，因此为1.

对于D2L里的线性回归模型，编者们选择使用正态分布来初始化模型内参数的权重，在这里我也选择和他们一样，同时使用替换方法`normal_`和`fill_`来重写参数值。

{{< highlight python >}}
net = nn.Sequential(
    nn.Linear(12, 1),
)
net[0].weight.data.normal_(0, 0.001)
net[0].bias.data.fill_(0)
{{</ highlight >}}

## 超参数 (Hyperparameters)

*训练的时候总是少不了超参数。*
{{< highlight python >}}
batch_size = 32
lr = 1e-3
num_epochs = 500
{{</ highlight >}}

注: 同上，学习率`lr`在这种情况下确实有问题，但先暂时不做改动。  

## 损失函数与优化器

对于 Loss function 和优化算法，依然与D2L保持一致，使用 `MSELoss`类和`SGD`.  

### 背景知识：何为MSE?

实际上，MSE看着高大上，实际上就是高中数学里概率统计里的方差，实际上，定义都完全一致:

\[
\text{MSE} = \frac{1}{n} \sum_{i=1}^{n} \left( y_i - \hat{y}_i \right)^2
\]

其中:  

- \(n\) 为数据点数量（既预测出的Feature的数量）
- \(y_i\) 是实际值（Ground Truth）
- \(\hat{y_i}\) 是模型的预测值
- \(y_i - \hat{y}\) 代表残差

MSE越小代表模型拟合的越小，反之.  

### 背景知识：何为SGD?

*我也不知道，但我以后也许会知道.*
*这部分姑且留给以后学完高数的我来写.*

建议参考: [深度学习——优化器算法Optimizer详解（BGD、SGD、MBGD、Momentum、NAG、Adagrad、Adadelta、RMSprop、Adam）](https://www.cnblogs.com/guoyaohua/p/8542554.html)

## 训练，启动

{{< highlight python >}}
history = []
for epoch in range(num_epochs):
    for X, y in train_iter:
        l = loss(net(X), y)
        trainer.zero_grad()
        l.backward()
        trainer.step()
    l = loss(net(feature_tensor), label_tensor)
    print(f"epoch {epoch + 1}, loss {l:f}")
    history.append(l)
{{</ highlight>}}

上面的代码总结起来，其实也就这么几件事:  

对每个mini batch (大小由超参数中的 `batch_size` 决定):

1. 正向传播: 计算模型对这组 mini batch 的 loss.
2. 重置模型中每个参数的梯度.
3. 反向传播: 根据计算出的loss, 对权重矩阵\(\mathbf{W}\)中的每一个参数，计算它们的梯度，为下一步调整权重矩阵做准备.
4. 使用上一步计算得出的梯度调整模型的权重矩阵\(\mathbf{W}\).

当每一个 mini batch 都经历过一次计算后，便是一个 epoch .
而在每个 epoch 结束之后，计算出此时模型的 loss, 输出并记录.

## 理想很饱满，现实很骨感

敲完代码，迫不期待按下执行，出问题了:  
![Gradient explosion, resuting NaN loss](https://img30.360buyimg.com/img/jfs/t20271017/148009/36/44199/13746/6710c3f3Fe450e12e/ffe5b3abbae75684.png.avif) 
  
**不是，哥们。这不对吧?**  
*这和说好的不一样啊!*  

那咋办呢？快请ChatGPT大仙!  
![ChatGPT's result of Gradient explosion](https://img30.360buyimg.com/img/jfs/t20271017/91870/12/54317/32201/6710c6e4Fd6cbdc92/0115152f49f02755.png.avif)  

## 梯度爆炸是什么

ChatGPT是这么说的:  
> 梯度爆炸（Gradient Explosion）是深度学习中常见的一个问题，特别是在梯度反向传播时，某些参数的梯度变得非常大，导致模型参数更新过大，从而使得模型训练不稳定甚至发散。梯度爆炸可能是你在代码中出现 nan 问题的原因之一。  

既然提到了梯度，那还是不得不上公式:

以下内容引用自 D2L 3.1.1.4 随机梯度下降:
> 在每次迭代中，我们首先随机抽样一个小批量 \(\mathcal{B}\)， 它是由固定数量的训练样本组成的。 然后，我们计算小批量的平均损失关于模型参数的导数（也可以称为梯度）。 最后，将梯度乘以一个预先确定的正数\(\eta\)，并从当前参数的值中减掉。
> 我们用下面的数学公式来表示这一更新过程（表示偏导数）：
\[
(\mathbf{w},b) \leftarrow (\mathbf{w},b) - \frac{\eta}{|\mathcal{B}|} \sum_{i \in \mathcal{B}} \partial_{(\mathbf{w},b)} l^{(i)}(\mathbf{w},b)
\]
> \(|\mathcal{B}|\)表示每个小批量中的样本数，这也称为批量大小（batch size）。 \(\eta\)表示学习率（learning rate）。

## 解决梯度爆炸 Part 1

梯度计算的简化理解:
\[
\begin{aligned}
\nabla_{\mathbf{x}} y = \frac{\partial L_{oss}}{\partial \mathbf{w}} \\
L_{oss} = \eta * \text{MSE}
\end{aligned}
\]

如果MSE计算出来的loss太大，那就用一个超级小的learning rate 降下来就好了嘛（  
于是乎，把lr给调到了一个超级小的值，(具体来说, 1e-7).  
让我们再试一次:  
![Decending speed of loss became very small after adjusting learning rate to a very small value](https://img30.360buyimg.com/img/jfs/t20271017/223437/33/46414/65918/6710ce1fFa3064a7d/d694b332348cff6d.png.avif)  

的确是能跑，loss也正常了，但是这下降速度也太慢了一点。  
图里更直观一点:  
![Train loss without normalize](https://img30.360buyimg.com/img/jfs/t20271017/148609/9/46155/22143/6710ceadF31a6442f/258b6fd2de7268f3.png.avif)  
200个 epoch, loss 下降就那么点，对小数据集和小模型（比如线性回归）还好，毕竟一个 epoch 速度很快，但对大型模型来说，这要算到猴年马月。  

*"ChatGPT，还有别的方法吗？"*  

## 解决梯度爆炸 Part 2

ChatGPT 的回答:
> Unscaled Features:
In the code, it seems the features (input X) are used as-is from the dataset. The Boston dataset’s features (e.g., CRIM, ZN, etc.) may have widely varying scales. For example, CRIM might be in the range of [0, 100], whereas ZN might be in the range of [0, 10].  
Large-scale values can cause instability in the gradient calculations, leading to nan values in the loss.  
Solution: Standardize or normalize the features before feeding them into the model. You can do this by subtracting the mean and dividing by the standard deviation for each feature.

太长不看版: **对Features做归一化/标准化**.

### 那么，归一化和标准化又是什么

还是让ChatGPT来解释:  
> 归一化和标准化是数据处理中的两种常见技术，主要用于在进行机器学习、统计分析或优化问题时，使不同特征的数据保持在同一尺度上，以避免某些特征因为数值范围过大而主导模型。  
> 归一化是将数据缩放到一个特定的范围，通常是 [0, 1] 或 [-1, 1]，其目的是使不同特征的数据具有相似的尺度。

提取关键词: *统一尺度* .  
回到最开始的数据集, NOX 和 AGE 便是尺度不统一的最好例子.  

### 用 Min-Max 来处理数据集中的不统一尺度

此时，在数据集的处理里加几行代码，把特征先归一化，再进行接下来的处理:

{{< highlight python >}}
feature_min, _ = feature_tensor.min(dim=0, keepdim=True)
feature_max, _ = feature_tensor.max(dim=0, keepdim=True)
feature_tensor = (feature_tensor - feature_min) / (feature_max - feature_min)
{{< / highlight >}}

本质上，上面的代码也只是干了以下这条公式干的事:  
\[
    X_{\text{new}} = \frac{X - X_{\text{min}}}{X_{\text{max}} - X_{\text{min}}}
\]

此时数据集处理的完整代码:  
{{< highlight python >}}
feature = data_csv.drop("MEDV", axis=1)
label = data_csv["MEDV"]

feature_tensor = torch.tensor(feature.values, dtype=torch.float32)
label_tensor = torch.tensor(label.values, dtype=torch.float32).reshape(-1, 1)

feature_min, _ = feature_tensor.min(dim=0, keepdim=True)
feature_max, _ = feature_tensor.max(dim=0, keepdim=True)
feature_tensor = (feature_tensor - feature_min) / (feature_max - feature_min)

dataset = data.TensorDataset(feature_tensor, label_tensor)

train_size = int(0.8 * len(dataset))
test_size = len(dataset) - train_size
train_dataset, test_dataset = data.random_split(dataset, [train_size, test_size])

train_iter = data.DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
test_iter = data.DataLoader(test_dataset, batch_size=batch_size, shuffle=True)
{{< / highlight >}}

## 继续训练

在使用归一化处理数据之后，再来一遍训练：  
![Train loss with normalize](https://img30.360buyimg.com/img/jfs/t20271017/175646/35/49263/20119/6710d4f1F3e661027/c3d4a4e51d77d2d7.png.avif)  

好起来了，都好起来了.jpg  

## 总结与优化可能

不得不说，自己从零开始，用其他数据集如法炮制，在出结果的那一刻还是很激动的，毕竟是自己实现的。  

再给自己留一些问题:

- 除了SGD这一种Optimizer以外，还存在其他的Optimizer，比如RMSprop, Adam，尝试使用它们.
- 更换不同的Loss function （比如Huber） 和 权重初始化方法，查看效果.  

