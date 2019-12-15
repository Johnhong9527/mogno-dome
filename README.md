### 创建mongo
```bash
docker run -d -p 27017:27017 -v /home/feishu/Data/docker/storybl_mogodb/mongo_configdb:/data/configdb -v /home/feishu/Data/docker/storybl_mogodb/mongo_db:/data/db --name storybl_mogodb mongo
```

