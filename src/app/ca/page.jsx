'use client';

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

// 获取CA分析数据
const fetchAnalysis = async (ca) => {
    if (!ca) return null;
    const response = await fetch(`/api/token-analysis/${ca}`);
    const data = await response.json();
    return data;
};

export default function CA() {
    const [ca, setCA] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ["token-analysis", ca],
        queryFn: () => fetchAnalysis(ca),
        enabled: Boolean(ca),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const caValue = formData.get("ca");
        setCA(caValue);
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto p-2 lg:p-4">
                {/* 搜索表单 - 减小上下间距 */}
                <form onSubmit={handleSubmit} className="mb-3">
                    <Card>
                        <CardContent className="p-1.5">
                            <div className="flex gap-1.5">
                                <Input
                                    name="ca"
                                    placeholder="输入 Solana CA 地址..."
                                    className="flex-1 h-9 text-sm"
                                />
                                <Button
                                    type="submit"
                                    className="h-9 px-4 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                >
                                    分析
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                {isLoading && <LoadingSkeleton />}
                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <p className="text-red-500">加载失败: {error.message}</p>
                        </CardContent>
                    </Card>
                )}
                {data?.data && <AnalysisResult data={data.data} />}
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-[180px] w-full rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-[400px] rounded-xl" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-[400px] rounded-xl" />
                </div>
            </div>
        </div>
    );
}

function TweetCard({ tweet }) {
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <>
            <Card className="hover:shadow-xs transition-shadow duration-200">
                <CardContent className="p-1.5">
                    <div className="flex items-start gap-1">
                        <img
                            src={tweet.author.avatar}
                            alt={tweet.author.name}
                            className="w-6 h-6 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium truncate">{tweet.author.name}</p>
                                    <p className="text-xs text-gray-500 truncate">@{tweet.author.screen_name}</p>
                                </div>
                                <p className="text-xs text-gray-500 whitespace-nowrap">
                                    {dayjs(tweet.created_at).fromNow()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="mt-1 text-sm leading-snug text-gray-700">{tweet.text}</p>

                    {tweet.media?.photo && (
                        <div className="mt-0.5 grid gap-px grid-cols-2">
                            {tweet.media.photo.slice(0, 4).map(photo => (
                                <div
                                    key={photo.id}
                                    className="relative cursor-zoom-in"
                                    onClick={() => setSelectedImage(photo)}
                                >
                                    <AspectRatio ratio={16 / 9}>
                                        <img
                                            src={photo.media_url_https}
                                            className="object-cover w-full h-full rounded-sm"
                                            alt=""
                                        />
                                    </AspectRatio>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-1 flex gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-0.5">
                            <span className="text-red-400">❤</span>
                            {tweet.favorites > 1000 ? `${(tweet.favorites / 1000).toFixed(1)}k` : tweet.favorites}
                        </span>
                        <span className="flex items-center gap-0.5" title="转发">
                            <span className="text-green-500">🔄</span>
                            {tweet.retweets.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-0.5" title="回复">
                            <span className="text-blue-500">💬</span>
                            {tweet.replies.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-0.5" title="浏览">
                            <span className="text-gray-500">👁️</span>
                            {tweet.views.toLocaleString()}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* 图片预览对话框 */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-3xl p-0">
                    {selectedImage && (
                        <img
                            src={selectedImage.media_url_https}
                            alt=""
                            className="w-full h-auto"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

function AnalysisResult({ data }) {
    return (
        <div className="space-y-2">
            <Card className="border shadow-sm">
                <CardHeader className="py-2 px-4 bg-blue-50">
                    <h2 className="text-base font-semibold text-blue-600">AI 叙事分析</h2>
                </CardHeader>
                <CardContent className="p-4">
                    <p className="text-sm leading-relaxed text-gray-700">{data.analysis}</p>
                </CardContent>
            </Card>

            {/* 推文区域保持现有结构，调整高度 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {/* 热门推文 */}
                <div className="h-[calc(100vh-180px)]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-base">🔥</span>
                        <h2 className="text-sm font-semibold">热门推文</h2>
                    </div>
                    <ScrollArea className="h-full">
                        <div className="space-y-1 pr-2">
                            {data.top_tweets.map((tweet) => (
                                <TweetCard key={tweet.tweet_id} tweet={tweet} />
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* 最新推文 */}
                <div className="h-[calc(100vh-180px)]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-base">📝</span>
                        <h2 className="text-sm font-semibold">最新推文</h2>
                    </div>
                    <ScrollArea className="h-full">
                        <div className="space-y-1 pr-2">
                            {data.latest_tweets.map((tweet) => (
                                <TweetCard key={tweet.tweet_id} tweet={tweet} />
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
