'use client';

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

// 获取推文数据的函数
const fetchTweets = async () => {
  const response = await fetch(`/api/tweets?limit=50&offset=0`);
  const data = await response.json();
  return data;
};

// 推文卡片组件
const TweetCard = ({ tweet, index, followerThreshold }) => {
  const isHighlighted = tweet.followers_count >= followerThreshold;
  const twitterProfileUrl = `https://twitter.com/${tweet.screen_name}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`h-full hover:shadow-lg transition-all bg-white/50 backdrop-blur-sm ${
        isHighlighted ? 'border-2 border-blue-400 shadow-lg' : 'border-none'
      }`}>
        <CardHeader className="p-3 pb-0">
          <div className="flex items-center gap-2">
            <a 
              href={twitterProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <Avatar className="w-8 h-8 ring-2 ring-primary/10">
                <AvatarImage src={tweet.profile_image_url} alt={tweet.name} />
                <AvatarFallback>{tweet.name[0]}</AvatarFallback>
              </Avatar>
            </a>
            <div className="flex flex-col min-w-0">
              <div className="font-semibold text-sm leading-tight truncate">{tweet.name}</div>
              <div className="text-xs text-gray-500 truncate">@{tweet.screen_name}</div>
            </div>
            <div className="ml-auto text-xs text-gray-500">
              {dayjs(tweet.created_at).fromNow()}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          <p className="text-sm whitespace-pre-wrap line-clamp-3">{tweet.content}</p>
          
          {tweet.contract_address && (
            <div className="text-xs bg-gray-50 p-2 rounded-md font-mono break-all">
              {tweet.contract_address}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {tweet.tweet_url && (
              <a 
                href={tweet.tweet_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                原文
              </a>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-0">
          <div className="flex gap-2 items-center text-xs text-gray-500">
            <span title="粉丝数量" className="flex items-center gap-1">
              <span>👥</span>
              <span className="font-medium">{tweet.followers_count.toLocaleString()}</span>
              <span className="text-gray-400">粉丝数量</span>
            </span>
            <span title="关注数量" className="flex items-center gap-1">
              <span>👤</span>
              <span className="font-medium">{tweet.following_count.toLocaleString()}</span>
              <span className="text-gray-400">关注数量</span>
            </span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// 加载占位组件
const TweetSkeleton = () => {
  return (
    <Card className="h-full bg-white/50 backdrop-blur-sm border-none">
      <CardHeader className="p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex flex-col gap-1 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Skeleton className="h-3 w-full" />
      </CardFooter>
    </Card>
  );
};

export default function Home() {
  const [followerThreshold, setFollowerThreshold] = useState(1000);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [countdown, setCountdown] = useState(10);

  const {
    data,
    error,
    status,
    isLoading,
    isFetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["tweets"],
    queryFn: fetchTweets,
    refetchInterval: autoUpdate ? 10000 : false,
    refetchIntervalInBackground: false,
  });

  // 处理倒计时
  useEffect(() => {
    let timer;
    if (autoUpdate && !isFetching) {
      const updateTime = dataUpdatedAt + 10000; // 下次更新时间
      timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((updateTime - now) / 1000));
        setCountdown(remaining);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoUpdate, isFetching, dataUpdatedAt]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <TweetSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="container mx-auto text-center text-red-500">
          加载失败: {error.message}
        </div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="container mx-auto text-center text-gray-500">
          暂无数据
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="container mx-auto">
        <div className="mb-4 flex items-center gap-4 bg-white/80 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">粉丝数阈值：</label>
            <Input
              type="number"
              value={followerThreshold}
              onChange={(e) => setFollowerThreshold(Number(e.target.value))}
              className="w-32"
              min="0"
            />
            <span className="text-sm text-gray-500">
              (粉丝数 ≥ {followerThreshold} 的推文将被高亮显示)
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Switch
              checked={autoUpdate}
              onCheckedChange={setAutoUpdate}
              className="data-[state=checked]:bg-blue-500"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                自动更新
              </span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  autoUpdate 
                    ? isFetching 
                      ? 'bg-yellow-400 animate-pulse'
                      : 'bg-green-400' 
                    : 'bg-gray-400'
                }`} />
                <span className="text-xs text-gray-500">
                  {autoUpdate 
                    ? isFetching 
                      ? '更新中...'
                      : `${countdown}秒后更新`
                    : '已暂停'}
                </span>
              </div>
              {isFetching && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.data.map((tweet, index) => (
            <TweetCard 
              key={tweet.tweet_id} 
              tweet={tweet} 
              index={index}
              followerThreshold={followerThreshold}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
