"use client";
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, CheckCircle } from "lucide-react";

export default function TestPage() {
    const [username, setUsername] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/user/${username}`);
            const result = await response.json();

            if (result.success) {
                setData(result.data);
                setError('');
            } else {
                setError('用户数据获取失败');
            }
        } catch (err) {
            setError('请求发生错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    // 新增排序逻辑
    const sortedFollowers = data?.followers
        ?.sort((a, b) => b.user_info.followers_count - a.user_info.followers_count)
        ?.slice(0, 30) || [];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <Input
                    placeholder="输入推特用户名（例如：elonmusk）"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                />
                <Button
                    onClick={fetchData}
                    disabled={loading}
                    className="w-full md:w-auto"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            分析中...
                        </span>
                    ) : '开始分析'}
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {data && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* 用户身份卡片 */}
                        <Card className="hover:shadow-lg transition-shadow md:col-span-2 group relative overflow-hidden">
                            {/* 新增头图展示 */}
                            <div className="h-32 bg-gray-100 relative">
                                {data.header_image && (
                                    <Image
                                        src={data.header_image}
                                        alt="用户头图"
                                        fill
                                        className="object-cover"
                                        quality={100}
                                    />
                                )}
                            </div>
                            <CardHeader className="pb-4 relative z-10 bg-white">
                                <div className="flex flex-col items-center gap-4 -mt-12">
                                    <div className="relative">
                                        <Image
                                            src={data.profile_image_url_https.replace('_normal', '_400x400')}
                                            alt={data.name}
                                            width={96}
                                            height={96}
                                            className="rounded-full border-4 border-white shadow-lg mx-auto"
                                        />
                                        {data.blue_verified && (
                                            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                                                <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-500 fill-current">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center space-y-1">
                                        <div className="flex items-center justify-center gap-2">
                                            <h2 className="text-2xl font-bold">{data.name}</h2>
                                            {data.blue_verified && (
                                                <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-500 fill-current">
                                                    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.8.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.1 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-gray-600">@{data.screen_name}</p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* 社交数据卡片 */}
                        <Card className="hover:shadow-lg transition-shadow md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 mb-4">社交影响力</CardTitle>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1 p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <Users className="w-4 h-4" />
                                            <span className="text-sm">粉丝数</span>
                                        </div>
                                        <div className="text-2xl font-bold">{data.subscribers_count.toLocaleString()}</div>
                                    </div>
                                    <div className="space-y-1 p-3 bg-purple-50 rounded-lg">
                                        <div className="flex items-center gap-2 text-purple-600">
                                            <UserPlus className="w-4 h-4" />
                                            <span className="text-sm">关注数</span>
                                        </div>
                                        <div className="text-2xl font-bold">{data.friends_count.toLocaleString()}</div>
                                    </div>
                                    <div className="space-y-1 p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-2 text-green-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
                                            </svg>
                                            <span className="text-sm">推文数</span>
                                        </div>
                                        <div className="text-2xl font-bold">{data.statuses_count.toLocaleString()}</div>
                                    </div>
                                    <div className="space-y-1 p-3 bg-rose-50 rounded-lg">
                                        <div className="flex items-center gap-2 text-rose-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 9.5V17M16 9.5V17M12 7v9.5M9.5 3H17v4H9.5V3z" />
                                            </svg>
                                            <span className="text-sm">媒体数</span>
                                        </div>
                                        <div className="text-2xl font-bold">{data.media_count.toLocaleString()}</div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* 用户简介卡片 */}
                        <Card className="hover:shadow-lg transition-shadow md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    用户简介
                                </CardTitle>
                                <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                                    {data.description || "该用户暂无简介"}
                                </div>
                            </CardHeader>
                        </Card>

                        {/* 时间信息卡片组 */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                                        </svg>
                                        注册时间
                                    </CardTitle>
                                    <div className="text-lg font-semibold text-gray-800 mt-2">
                                        {new Date(data.created_at).toLocaleDateString('zh-CN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* 发盘数量卡片 */}
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">发盘数量</CardTitle>
                                    <div className="text-3xl font-bold text-emerald-600">
                                        {data.pump_count}
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* 历史曾用名卡片 */}
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">历史曾用名</CardTitle>
                                    <div className="text-lg font-semibold truncate">
                                        {data.screen_names
                                            .filter(name => name !== username)
                                            .join(", ") || "无记录"}
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* 改名次数卡片 */}
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">改名次数</CardTitle>
                                    <div className="text-3xl font-bold text-rose-600">
                                        {data.screen_names.filter(name => name !== username).length}
                                    </div>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-2xl font-bold">
                            关注TA的名人/KOL/VC <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{data.followers.length}</span>
                        </h2>
                        <span className="text-sm text-gray-500">显示前30位（按粉丝数排序）</span>
                    </div>

                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-50">
                            <tr className="text-xs font-medium text-gray-500 [&>th]:py-2 [&>th]:px-3">
                                <th className="text-left w-[8%]">排名</th>
                                <th className="text-left w-[40%]">用户信息</th>
                                <th className="text-left w-[12%]">粉丝数</th>
                                <th className="text-left w-[12%]">关注数</th>

                                <th className="text-left w-[10%]">简介</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedFollowers.map((follower, index) => (
                                <tr
                                    key={follower.follower_id_str}
                                    className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                                >
                                    <td className="py-2 px-3 font-medium text-blue-800">#{index + 1}</td>
                                    <td className="py-2 px-3">
                                        <a
                                            href={`https://twitter.com/${follower.user_info.screen_name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 no-underline group"
                                        >
                                            <Image
                                                src={follower.user_info.profile_image_url_https.replace('_normal', '_400x400')}
                                                alt={follower.user_info.name}
                                                width={32}
                                                height={32}
                                                className="rounded-full border border-gray-200"
                                                quality={100}
                                                priority
                                            />
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-semibold truncate">{follower.user_info.name}</h3>
                                                <p className="text-xs text-gray-500 truncate">@{follower.user_info.screen_name}</p>
                                            </div>
                                        </a>
                                    </td>
                                    <td className="py-2 px-3">{(follower.user_info.followers_count || 0).toLocaleString()}</td>
                                    <td className="py-2 px-3">{(follower.user_info.friends_count || 0).toLocaleString()}</td>
                                    <td className="py-2 px-3 text-xs text-gray-500 truncate max-w-[160px]">
                                        {follower.user_info.note || '无'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
