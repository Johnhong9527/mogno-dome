### 创建mongo
```bash
docker run -d -p 27017:27017 -v /home/feishu/Data/docker/storybl_mogodb/mongo_configdb:/data/configdb -v /home/feishu/Data/docker/storybl_mogodb/mongo_db:/data/db --name storybl_mogodb mongo
```



### docker中数据导出

#### 方法一

第一步进入mongodb容器

```
docker exec -it 容器名 /bin/sh
```

第二步导出数据，到与宿主文件系统映射的文件夹中。如果没有的话看第三步

```
 ./bin/mongodump -h ip:port  -d 数据库名 -o  linux环境下指定的文件夹 //如有用户名，则加上 --username xxx --password xxx
```

第三步

```
docker cp 容器名:容器内存备份数据的地址  宿主机的存放备份数据的地址
```

#### 方法二
1.直接在宿主机执行导出操作
将备份指令写入sh文件，建立宿主机和docker容器之间的联系
```
docker run --link 容器名:mongodb -v 容器存放备份数据的地址:宿主机存放导出文件的地址 mongo 宿主机存放sh文件的地址
# 例如：
docker run --link zks-mongo:mongodb -v /zks/db_backup:/zks/db_backup mongo /zks/db_backup/backupright.sh
```


### docker中数据数据恢复
将数据到入docker中mongodb,且mongodb已经存在这个数据库表

  先删掉原来的的数据库表，否则，新导入进去的数据如果有一些和原来的数据重复就不能导入成功
  删掉数据库表的步骤：
  1.进入mongodb容器
  2.执行mongo
  3.查看有哪些数据库 show dbs
  4.进入某个数据库 use 数据库名
  5.查看数据库中有哪些表 show collections
  6.删除数据库中的某个表 db.数据库表名.drop()

  将要导入的数据库表放在容器映射到宿主机的路径下
  执行：
  mongorestore -h mongodb容器的ip -d 要导入的数据库的表名 要导入的数据库表存放的路径




### 原文：Docker备份、导入mongodb数据
一.备份数据库：
方法一：进入mongodb容器：
docker exec -it 容器名 /bin/sh

执行备份指令：
mongodump -h ip  -d 数据库名 -o  容器存放备份数据的地址
注意：若容器内的存备份数据的地址没有被映射出来，则exit推出容器回到宿主机,
          执行：
          docker cp 容器名:容器内存备份数据的地址  宿主机的存放备份数据的地址
方法二：直接在宿主机执行导出操作：

            将备份指令写入sh文件，建立宿主机和docker容器之间的联系

          docker run --link 容器名:mongodb -v 容器存放备份数据的地址:宿主机存放导出文件的地址 mongo 宿主机存放sh文件的地址
          例如：
         docker run --link zks-mongo:mongodb -v /zks/db_backup:/zks/db_backup mongo /zks/db_backup/backupright.sh

二、导入数据库

  将数据到入docker中mongodb,且mongodb已经存在这个数据库表

  先删掉原来的的数据库表，否则，新导入进去的数据如果有一些和原来的数据重复就不能导入成功
  删掉数据库表的步骤：
  1.进入mongodb容器
  2.执行mongo
  3.查看有哪些数据库 show dbs
  4.进入某个数据库 use 数据库名
  5.查看数据库中有哪些表 show collections
  6.删除数据库中的某个表 db.数据库表名.drop()

  将要导入的数据库表放在容器映射到宿主机的路径下
  执行：
  mongorestore -h mongodb容器的ip -d 要导入的数据库的表名 要导入的数据库表存放的路径
————————————————
版权声明：本文为CSDN博主「crush1988」的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/crush1988/article/details/81019302