2015第一篇文章，没啥技术含量，权当作个笔记。

我们通常在一些git托管网站托管我们的代码，除了大家耳熟能详的[GitHub](https://github.com), 还有国外的[Bitbucket](https://bitbucket.org/)等，国内的[开源中国](http://git.oschina.net/)、[Coding](https://coding.net/)等都是不错的选择。

今天以Coding上私有库的部署为例来讲解如何使用Coding的hook服务来自动部署到生产环境的服务器。

## 准备工作

- 在Coding.net上创建一个私有库
- 安装了web服务的服务器

## 在服务器上

1. 创建web服务器用户目录，这里以apache用户为例，不同的环境请根据自己环境自行修改：

```shell
sudo mkdir /var/www/.ssh
sudo chown -R apache:apache /var/www/.ssh/
```

2. 生成公钥

```shell
sudo -Hu apache ssh-keygen -t rsa # 请选择 "no passphrase"，一直回车下去
sudo cat /var/www/.ssh/id_rsa.pub # 查看生成的密钥内容，复制全部
```

3. 准备钩子文件

在你的www目录建立一个目录`hook`, 里面放上一个php文件，内容如下：

<script src="https://gist.github.com/overtrue/0bf1cd704bf804de2e2c.js"></script>

在此目录下建立一个目录`repos`:

```shell
mkdir repos
```

修改目录权限：

```shell
chown -R apache:apache /www/hook # 这里请改成你创建的hook目录
```

确保你的hook文件可以访问：http://example.com/hook/index.php，钩子准备完成。

## 在代码托管网站

1. 复制`/var/www/.ssh/id_rsa.pub`的内容并添加到Coding.net公钥:

> 选择项目 > 设置 > 部署公钥 > 新建 > 粘贴到下面框并确认

2. 添加hook

> 选择项目 > 设置 > WebHook > 新建hook > 粘贴你的hook/index.php所在的网址。比如:http://example.com/hook/index.php, 令牌可选，但是建议写上。

稍过几秒刷新页面查看hook状态，显示为绿色勾就OK了。

## 初始化

1. 我们需要先在服务器上clone一次，以后都可以实现自动部署了：

```shell
sudo chown -R apache:apache /www/hook/repos
sudo -Hu apache git clone git@coding.net:you/repo.git /www/hook/repos/  --depth=1
```

2. 往Coding.net提交一次代码测试：

```shell
git commit -am "test hook" --allow-empty
git push 
```

OK，正常的话你在代码里配置的目标目录里就会有你的项目代码了。

