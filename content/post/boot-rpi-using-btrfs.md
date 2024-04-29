+++
title = '使用 Btrfs 格式的根分区启动树莓派'
date = 2022-07-20T22:00:47+08:00
draft = false
tags = ['Btrfs', '树莓派']
categories = '折腾'

license = true
toc = true
comments = true
+++

## 重新生成 initramfs

在默认情况下，Raspberry Pi OS 的 btrfs 是支持是作为 kernel modules 存在的，需要重新生成对应的 initramfs 使内核能够挂载 btrfs 文件系统.

```shell
# 安装相应依赖
# initramfs-tools 默认情况下已经安装
sudo apt install initramfs-tools btrfs-tools
```

向 `/etc/initramfs-tools/modules` 中添加相应的 kernel modules :  
`sudo vi /etc/initramfs-tools/modules`

```shell
...
btrfs
xor
zlib_deflate
raid6_pq

```

保存后，使用 `mkinitramfs -o /boot/initramfs-btrfs.gz` 生成新的 initramfs.  
之后，修改 `/boot/config.txt` 加载新的 initramfs.

```shell
sudo vi /boot/config.txt

# For more options and informations see
# http://rpf.io/configtxt
# Some settings may impact device functionality. See link above for details
initramfs initramfs-btrfs.gz
```

重启设备，确认新的 initramfs 正常被加载.

* * *

## 将 ext4 rootfs 转换成 btrfs 格式

在 **linux** 下，将装有系统的 SD卡 / 硬盘链接电脑，通过 `btrfs-convert` 将 rootfs 转换成 btrfs 格式，以我的硬盘为例:  
注: /dev/sdb2 为 rootfs 分区，下文以它为例

```text
# 如果是SD卡，将 /dev/sda 替换成对应设备

root@baysonfox:~# fdisk -l /dev/sda

Disk /dev/sdb: 465.76 GiB, 500107862016 bytes, 976773168 sectors
Disk model:                 
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 4096 bytes / 33553920 bytes
Disklabel type: dos
Disk identifier: 0x0ee3e8a8

Device     Boot     Start       End   Sectors   Size Id Type
/dev/sdb1            8192    532479    524288   256M  c W95 FAT32 (LBA)
/dev/sdb2          532480 138127359 137594880  65.6G 83 Linux
/dev/sdb3       138127360 976773119 838645760 399.9G 83 Linux
```

1. 使用 `fsck.ext4 /dev/sdb2` 确认分区正常
2. 使用 `btrfs-convert /dev/sdb2` 将 ext4 格式的 rootfs 转换为 btrfs 格式
3. 挂载转换完成的 btrfs rootfs

    ```shell
    # 挂载 rootfs 和 boot
        sudo mkdir /tmp/rootfs
    # rootfs
        sudo mount /dev/sdb2 /tmp/rootfs
    # boot
        sudo mount /dev/sdb1 /tmp/rootfs/boot
    ```

4. 在 rootfs 下创建 swap 子卷，并禁用 btrfs 的 CoW，存放 swap 文件

    ```shell
    # 在树莓派 rootfs 分区下创建 ./swap 子卷存放 swap 文件 
        cd /tmp/rootfs
        sudo btrfs subvolume create swap
    # 根据 https://wiki.archlinux.org/title/btrfs#Swap_file
        sudo chattr +C swap/
        cd swap
        sudo dd if=/dev/zero of=swapfile bs=1M count=512 status=progress
        sudo chmod 0600 swapfile
    # 编辑 /etc/dphys-swapfile 添加 CONF_SWAPFILE=/swap/swapfile
        sudo vi /tmp/rootfs/etc/dphys-swapfile
        # [...]
        # where we want the swapfile to be, this is the default
        CONF_SWAPFILE=/swap/swapfile
        # [...]
    ```

* * *

## 调整挂载和系统设置

1. 编辑 `/tmp/rootfs/etc/fstab`

    ```shell
    # 编辑 /etc/fstab
    # 将 / 的挂载条目的 ext4 改为 btrfs, 并且将最后的 0 1 改为 0 0, 禁用fsck
        sudo vi /tmp/rootfs/etc/fstab
        # e.g. 
        # PARTUUID=c469d4fc-02 / btrfs defaults,noatime 0 0
    ```

2. 编辑 `/tmp/rootfs/boot/cmdline.txt`

    ```shell
        # 编辑 /boot/cmdline.txt, 将 rootfstype=ext4 改为 rootfstype=btrfs fsck.repair=yes 改为 fsck.repair=no
        sudo vi /tmp/rootfs/boot/cmdline.txt
        # e.g. 
        # console=serial0,115200 console=tty1 root=PARTUUID=0ee3e8a8-02 rootfstype=btrfs fsck.repair=no rootwait
    ```

3. 回到树莓派，添加一段脚本，防止以后 kernel 升级后无法启动

    ```shell
    # 参考 https://www.ephestione.it/booting-btrfs-root-partition-on-raspberri-pi/

    sudo vi /etc/kernel/postinst.d/btrfs-update

        #!/bin/bash 
        if [ "x$2" != "x/boot/kernel8.img" ]; then 
            exit 0 
        fi 
        echo ============ UPDATE INITRAMFS ============== 
        mkinitramfs -o /boot/initramfs-btrfs.gz
        echo ============ UPDATE COMPLETED ==============

    # 确保权限
    sudo chmod 755 /etc/kernel/postinst.d/btrfs-update
    ```

4. 重启回到系统，重新生成 swapfile

    ```shell
    sudo dphys-swapfile swapoff
    sudo dphys-swapfile uninstall
    sudo dphys-swapfile install
    sudo dphys-swapfile swapon
    ```
