---
layout: post
title: 在服务器上使用 shadowsocks 客户端
excerpt: 在国内服务器上经常装不上一些包，这时候我们可以用 shadowsocks 代理来完成。
---

在阿里云上装一些 npm 包的时候各种装不上，或者装 composer 包也是经常断掉。原因都在网络上，解决这个问题的方法只能是代理了。

# 安装

## CentOS

```shell
$ yum install python-pip    
$ pip install shadowsocks
```

## Ubuntu

```shell
$ sudo apt-get install python-pip python-dev build-essential 
$ pip install shadowsocks
```

# 配置

创建配置文件：

```shell
$ vim /etc/shadowsocks.json
```

内容如下

```json
{
    "server":"x.x.x.x",             #ss服务器IP
    "server_port":1035,             #ss服务器端口
    "local_address": "127.0.0.1",   #本地ip
    "local_port":1080,              #本地端口
    "password":"password",          #连接ss密码
    "timeout":300,                  #等待超时
    "method":"rc4-md5",             #加密方式(与服务器一致)
    "fast_open": false,             # true 或 false。如果你的服务器 Linux 内核在3.7+，可以开启 fast_open 以降低延迟。开启方法： echo 3 > /proc/sys/net/ipv4/tcp_fastopen 开启之后，将 fast_open 的配置设置为 true 即可
    "workers": 1                    # 工作线程数
}
```

启动shawodsocks 

```shell
$ nohup sslocal -c /etc/shadowsocks.json /dev/null 2>&1 &
// 然后加入开机自启动
$ echo " nohup sslocal -c /etc/shadowsocks.json /dev/null 2>&1 &" /etc/rc.local
```

查看后台进程

```shell
$ ps aux |grep sslocal |grep -v "grep"
root      7587  0.1  0.1 184180  8624 pts/0    S    08:44   0:03 /usr/bin/python /usr/bin/sslocal -c /etc/shadowsocks.json /dev/null
```

测试我们的代理：

```shell
$ curl --socks5 127.0.0.1:1080 http://httpbin.org/ip
```

返回以下的样子：

```json
{
  "origin": "45.124.xx.xx" # 如果这个 IP 是你 shadowsocks 服务器的 IP 就 OK了。
}
```
