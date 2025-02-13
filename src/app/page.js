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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

// 添加 UUID 生成和获取函数
const getOrCreateUUID = () => {
  if (typeof window !== 'undefined') {
    let uuid = localStorage.getItem('visitorUUID');
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem('visitorUUID', uuid);
    }
    return uuid;
  }
  return '';
};

// 修改 fetchTweets 函数
const fetchTweets = async () => {
  const uuid = getOrCreateUUID();
  const response = await fetch(`/api/tweets`, {
    headers: {
      'X-Visitor-UUID': uuid
    }
  });
  const data = await response.json();
  return data;
};

const CircularProgress = ({ progress, size = 16, strokeWidth = 2, className = "" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* 背景圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* 进度圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-blue-500 transition-all duration-200"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

const TweetCard = ({
  tweet,
  index,
  followerThreshold,
  kolThreshold,
  renameThreshold,
  contractThreshold,
  filterLogic,
  onBlock,
  isBlocked
}) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 更新高亮逻辑
  const meetsFollowerThreshold = tweet.followers_count >= followerThreshold;
  const meetsKolThreshold = (tweet.followers?.length || 0) >= kolThreshold;
  const meetsFollowerKolCondition = filterLogic === 'AND'
    ? meetsFollowerThreshold && meetsKolThreshold
    : meetsFollowerThreshold || meetsKolThreshold;

  // 添加改名和发盘条件
  const meetsRenameThreshold = (tweet.historical_screen_names?.length - 1 || 0) <= renameThreshold;
  const meetsContractThreshold = tweet.unique_contract_count <= contractThreshold;
  const meetsRenameContractCondition = meetsRenameThreshold && meetsContractThreshold;

  // 最终高亮条件：所有条件都满足
  const isHighlighted = meetsFollowerKolCondition && meetsRenameContractCondition;

  const twitterProfileUrl = `https://twitter.com/${tweet.screen_name}`;
  const gmgnUrl = `https://gmgn.ai/sol/token/0frFvctC_${tweet.contract_address}`;
  const gmgnLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFLSURBVHgB5ZYxbsIwFIbtqmr3Dj1Bhxa1S5d261RxgoC4BSsTgoWVgZkVASdATGywsBABAydgYGOAxYDhB/xIZAcibMS3vDj+Hfn9fnkJY/cONxVWfU8cj2vNkYztgs8v0T8wyzzqBP/5T5nJz9urOuHtr+Q8Mouqd98BkHiuKOMeS0XSFwfpQN3tOMD5tniFEIHzOHtTPbDvAN152HsdRsb7UMatAZb7zATrDnA4UM79yRvZUkcRvLwnZEx+CRYn6IzuvAW9yVRGOEHB/KUcamSLe30grkxNcccBejb1TCNwwfo7z86BPh/Y7wO4oB0RoA9QdH0hLOPZeCijM/8D2r6vc4Y6QTNHxuD2/gnpjqkj392luuD3SQbqRNhX1v0aAMgcZ5+bLwJ1/Z0DAE7Q6gfWHYh9A5uaOKmLa24gKsZ9QHf2FNNasO7ACmsBgQNQAes8AAAAAElFTkSuQmCC";

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`h-full hover:shadow-lg transition-all bg-white/50 backdrop-blur-sm ${isHighlighted
        ? 'border-2 border-amber-400 shadow-lg bg-gradient-to-r from-amber-50/50 to-white/50 ring-2 ring-amber-200'
        : 'border-none'
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
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBlock();
              }}
              className="ml-auto text-gray-500 hover:text-red-500"
              title="拉黑此用户"
            >
              <span className="sr-only">拉黑用户</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          <p className="text-sm whitespace-pre-wrap line-clamp-3">{tweet.content}</p>

          {tweet.contract_address && (
            <div className="text-xs bg-gray-50 p-2 rounded-md font-mono break-all">
              <div className="flex items-center justify-between gap-2">
                <span>{tweet.contract_address}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(tweet.contract_address)}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                  >
                    {copied ? '已复制!' : '复制'}
                  </button>
                  <a
                    href={gmgnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-6 h-6 hover:opacity-80 transition-opacity"
                    title="在 GMGN 中查看"
                  >
                    <img src={gmgnLogo} alt="GMGN" className="w-5 h-5" />
                  </a>
                </div>
              </div>
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
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 items-center text-xs text-gray-500">
              <span title="粉丝数量" className="flex items-center gap-1">
                <span>👥</span>
                <span className="font-medium">{tweet.followers_count.toLocaleString()}</span>
                <span className="text-gray-400">粉丝</span>
              </span>
              <span title="关注数量" className="flex items-center gap-1">
                <span>👤</span>
                <span className="font-medium">{tweet.following_count.toLocaleString()}</span>
                <span className="text-gray-400">关注</span>
              </span>
              <span title="发盘数量" className="flex items-center gap-1">
                <span>📝</span>
                <span className="font-medium">{tweet.unique_contract_count.toLocaleString()}</span>
                <span className="text-gray-400">发盘</span>
              </span>
              <span title="改名次数" className="flex items-center gap-1">
                <span>🔄</span>
                <span className="font-medium">{tweet.historical_screen_names.length - 1}</span>
                <span className="text-gray-400">改名</span>
              </span>
            </div>

            {tweet.followers && tweet.followers.length > 0 && (
              <div className="space-y-1">
                <Collapsible
                  open={isOpen}
                  onOpenChange={setIsOpen}
                  className="space-y-2"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-xs text-muted-foreground hover:bg-blue-50 w-full justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <span>🎩 关注TA的KOL/名人/VC(点击展开)</span>
                        <Badge
                          variant="outline"
                          className="px-1.5 py-0.5 text-xs font-mono bg-blue-100/50"
                        >
                          {tweet.followers.length}
                        </Badge>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-blue-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-blue-500" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2">
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                      {tweet.followers.map((follower) => (
                        <a
                          key={follower.follower_user_id}
                          href={`https://twitter.com/${follower.user_info.screen_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors group"
                        >
                          <Avatar className="w-8 h-8 ring-2 ring-blue-100">
                            <AvatarImage src={follower.user_info.profile_image_url_https} />
                            <AvatarFallback>
                              {follower.user_info.name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {follower.user_info.name || '未知用户'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              @{follower.user_info.screen_name || 'unknown'}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="px-1.5 py-0.5 text-xs">
                                👥 {(follower.user_info.followers_count || 0).toLocaleString()}
                              </Badge>
                              <Badge variant="outline" className="px-1.5 py-0.5 text-xs">
                                👤 {(follower.user_info.friends_count || 0).toLocaleString()}
                              </Badge>
                            </div>
                            {follower.user_info.note && (
                              <p className="text-xs text-blue-600 mt-1">
                                {follower.user_info.note}
                              </p>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex flex-wrap gap-1">
                  {tweet.followers.slice(0, 9).map((follower) => (
                    <a
                      key={follower.follower_user_id}
                      href={`https://twitter.com/${follower.user_info.screen_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Avatar className="w-6 h-6 hover:ring-2 hover:ring-blue-200 transition-all">
                        <AvatarImage src={follower.user_info.profile_image_url_https} />
                        <AvatarFallback>
                          {follower.user_info.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

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
  const [followerThreshold, setFollowerThreshold] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('followerThreshold');
      return saved ? parseInt(saved, 10) : 1000;
    }
    return 1000;
  });
  const [kolThreshold, setKolThreshold] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kolThreshold');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [renameThreshold, setRenameThreshold] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('renameThreshold');
      return saved ? parseInt(saved, 10) : 1;
    }
    return 1;
  });
  const [contractThreshold, setContractThreshold] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('contractThreshold');
      return saved ? parseInt(saved, 10) : 1;
    }
    return 1;
  });
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [showHighlightedOnly, setShowHighlightedOnly] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [pausedTime, setPausedTime] = useState(null);
  const [filterLogic, setFilterLogic] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('filterLogic') || 'AND';
    }
    return 'AND';
  });

  // 添加拉黑列表状态
  const [blockedUsers, setBlockedUsers] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('blockedUsers');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // 添加拉黑列表是否展开的状态
  const [isBlockListOpen, setIsBlockListOpen] = useState(false);

  const {
    data,
    error,
    status,
    isLoading,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useQuery({
    queryKey: ["tweets"],
    queryFn: fetchTweets,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });

  const handleThresholdChange = (value) => {
    const newValue = Number(value);
    setFollowerThreshold(newValue);
    localStorage.setItem('followerThreshold', newValue.toString());
  };

  const handleKolThresholdChange = (value) => {
    const newValue = Number(value);
    setKolThreshold(newValue);
    localStorage.setItem('kolThreshold', newValue.toString());
  };

  const handleRenameThresholdChange = (value) => {
    const newValue = Number(value);
    setRenameThreshold(newValue);
    localStorage.setItem('renameThreshold', newValue.toString());
  };

  const handleContractThresholdChange = (value) => {
    const newValue = Number(value);
    setContractThreshold(newValue);
    localStorage.setItem('contractThreshold', newValue.toString());
  };

  const handleFilterLogicChange = (value) => {
    setFilterLogic(value);
    localStorage.setItem('filterLogic', value);
  };

  // 修改拉黑用户的处理函数
  const handleBlockUser = (user) => {
    const newBlockedUsers = [...blockedUsers, {
      id: user.user_id,  // 使用 user_id 作为唯一标识
      screenName: user.screen_name,
      name: user.name,
      profileImage: user.profile_image_url,
      blockedAt: new Date().toISOString()
    }];
    setBlockedUsers(newBlockedUsers);
    localStorage.setItem('blockedUsers', JSON.stringify(newBlockedUsers));
  };

  // 处理取消拉黑
  const handleUnblockUser = (userId) => {
    const newBlockedUsers = blockedUsers.filter(user => user.id !== userId);
    setBlockedUsers(newBlockedUsers);
    localStorage.setItem('blockedUsers', JSON.stringify(newBlockedUsers));
  };

  useEffect(() => {
    let timer;
    if (autoUpdate && !isFetching) {
      if (!isHovering) {
        const startTime = Date.now();
        const initialCountdown = pausedTime || 10;
        setCountdown(initialCountdown);

        timer = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const remaining = Math.max(0, initialCountdown - elapsed);
          setCountdown(remaining);

          if (remaining === 0) {
            clearInterval(timer);
            if (typeof refetch === 'function') {
              refetch();
            }
          }
        }, 200);
      } else {
        setPausedTime(countdown);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoUpdate, isFetching, isHovering, pausedTime]);

  useEffect(() => {
    if (!isHovering) {
      setPausedTime(null);
    }
  }, [dataUpdatedAt]);

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
        <div className="mb-0 flex flex-wrap items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md sticky top-0 z-50 border border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* 第一组筛选条件：粉丝/KOL */}
            <div className="flex items-center gap-2 p-1.5 pr-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-1.5">
                <span className="text-blue-600">粉丝≥</span>
                <Input
                  type="number"
                  value={followerThreshold}
                  onChange={(e) => handleThresholdChange(e.target.value)}
                  className="w-20 h-7 text-sm border-blue-200 bg-white"
                  min="0"
                />
              </div>

              <select
                value={filterLogic}
                onChange={(e) => handleFilterLogicChange(e.target.value)}
                className="h-7 text-sm border border-blue-200 rounded-md px-2 bg-white"
              >
                <option value="AND">且</option>
                <option value="OR">或</option>
              </select>

              <div className="flex items-center gap-1.5">
                <span className="text-blue-600">关注TA的名人≥</span>
                <Input
                  type="number"
                  value={kolThreshold}
                  onChange={(e) => handleKolThresholdChange(e.target.value)}
                  className="w-20 h-7 text-sm border-blue-200 bg-white"
                  min="0"
                />
              </div>
            </div>

            {/* 第二组筛选条件：发盘/改名 */}
            <div className="flex items-center gap-2 p-1.5 pr-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-600">发盘≤</span>
                <Input
                  type="number"
                  value={contractThreshold}
                  onChange={(e) => handleContractThresholdChange(e.target.value)}
                  className="w-16 h-7 text-sm border-amber-200 bg-white"
                  min="0"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-600">改名≤</span>
                <Input
                  type="number"
                  value={renameThreshold}
                  onChange={(e) => handleRenameThresholdChange(e.target.value)}
                  className="w-16 h-7 text-sm border-amber-200 bg-white"
                  min="0"
                />
              </div>
            </div>

            {/* 显示模式切换 */}
            <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <Switch
                checked={showHighlightedOnly}
                onCheckedChange={setShowHighlightedOnly}
                className="data-[state=checked]:bg-amber-500 h-5 w-9"
              />
              <span className="text-gray-600">
                {showHighlightedOnly ? '仅显示过滤' : '显示全部'}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <div className="flex items-center gap-2">
            <Switch
              checked={autoUpdate}
              onCheckedChange={setAutoUpdate}
              className="data-[state=checked]:bg-blue-500 h-5 w-9"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600">自动更新</span>
              {autoUpdate && !isHovering && (
                <CircularProgress
                  progress={(countdown / 10) * 100}
                  size={14}
                  className={isFetching ? 'animate-pulse' : ''}
                />
              )}
              <span className="text-xs text-gray-500">
                {autoUpdate
                  ? isHovering
                    ? '已暂停'
                    : isFetching
                      ? '更新中'
                      : `${countdown}秒`
                  : '已停止'}
              </span>
              {isFetching && (
                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
              )}
            </div>
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBlockListOpen(!isBlockListOpen)}
            className="h-7 px-2 flex items-center gap-1.5"
          >
            <span>已拉黑</span>
            <Badge variant="secondary" className="h-5">{blockedUsers.length}</Badge>
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5">
              <div className="relative flex items-center">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute -inset-1 bg-green-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <span className="text-gray-600">
                {data.meta.activeUsers}人在线
              </span>
            </div>
            <a
              href="https://redeemsol.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 hover:scale-105 px-2 py-1 rounded-full bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <span className="text-base">♻️</span>
              <span className="font-medium">免费领取SOL</span>
              <span className="text-xs text-blue-500">→</span>
            </a>
            <a
              href="https://www.wjx.cn/vm/mIbbjPI.aspx#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-600 hover:scale-105 px-2 py-1 rounded-full bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 hover:border-violet-200 hover:shadow-sm transition-all"
            >
              <span className="text-base">📣</span>
              <span className="font-medium">意见反馈</span>
              <span className="text-xs text-violet-500">→</span>
            </a>
          </div>
        </div>

        <div className={isBlockListOpen ? "h-[calc(50px+1rem)]" : "h-[15px]"} aria-hidden="true" />

        <Collapsible open={isBlockListOpen} onOpenChange={setIsBlockListOpen}>
          <CollapsibleContent>
            <div className="mb-4 bg-white/80 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">已拉黑用户列表</h3>
              {blockedUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">暂无拉黑用户</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blockedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.profileImage} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">@{user.screenName}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnblockUser(user.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        取消拉黑
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {data.data
            .filter(tweet => {
              if (blockedUsers.some(user => user.id === tweet.user_id)) {
                return false;
              }

              // 粉丝和KOL条件（使用AND或OR逻辑）
              const meetsFollowerThreshold = tweet.followers_count >= followerThreshold;
              const meetsKolThreshold = (tweet.followers?.length || 0) >= kolThreshold;
              const meetsFollowerKolCondition = filterLogic === 'AND'
                ? meetsFollowerThreshold && meetsKolThreshold
                : meetsFollowerThreshold || meetsKolThreshold;

              // 改名和发盘条件（始终使用AND逻辑）
              const meetsRenameThreshold = (tweet.historical_screen_names?.length - 1 || 0) <= renameThreshold;
              const meetsContractThreshold = tweet.unique_contract_count <= contractThreshold;
              const meetsRenameContractCondition = meetsRenameThreshold && meetsContractThreshold;

              // 最终条件：(粉丝 AND/OR KOL) AND (改名 AND 发盘)
              const isHighlighted = meetsFollowerKolCondition && meetsRenameContractCondition;

              return showHighlightedOnly ? isHighlighted : true;
            })
            .map((tweet, index) => (
              <TweetCard
                key={tweet.tweet_id}
                tweet={tweet}
                index={index}
                followerThreshold={followerThreshold}
                kolThreshold={kolThreshold}
                renameThreshold={renameThreshold}
                contractThreshold={contractThreshold}
                filterLogic={filterLogic}
                onBlock={() => handleBlockUser(tweet)}
                isBlocked={blockedUsers.some(user => user.id === tweet.user_id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
