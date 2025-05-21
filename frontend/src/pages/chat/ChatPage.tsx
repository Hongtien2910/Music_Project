import Topbar from "@/components/Topbar";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import UsersList from "./components/UsersList";
import ChatHeader from "./components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import MessageInput from "./components/MessageInput";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatTime = (date: string) => {
	return new Date(date).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};

const ChatPage = () => {
	const { user } = useUser();
	const { messages, selectedUser, fetchUsers, fetchMessages } = useChatStore();
	const bottomRef = useRef<HTMLDivElement>(null);
 	const navigate = useNavigate(); 

	useEffect(() => {
		if (user) fetchUsers();
	}, [fetchUsers, user]);

	useEffect(() => {
		if (selectedUser) fetchMessages(selectedUser.clerkId);
	}, [selectedUser, fetchMessages]);

	// Scroll xuống cuối mỗi khi messages thay đổi
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<main className='h-full rounded-lg bg-gradient-to-b bg-zinc-950 overflow-hidden'>
			<Topbar />
			<div className='grid lg:grid-cols-[300px_1fr] grid-cols-[80px_1fr] h-[calc(100vh-180px)]'>
				<UsersList />

				<div className='flex flex-col h-full'>
					{selectedUser ? (
						<>
							<ChatHeader />

							<ScrollArea className='h-[calc(100vh-340px)]'>
								<div className='p-4 space-y-4'>
									{messages.map((message) => {
										const isMe = message.senderId === user?.id;
										const bubbleClass = isMe
											? "bg-customRed rounded-lg rounded-br-none"
											: "bg-zinc-800 rounded-lg rounded-bl-none";

										return (
											<div
												key={message._id}
												className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}
											>
												<Avatar className='size-8'>
													<AvatarImage
														src={isMe ? user.imageUrl : selectedUser.imageUrl}
													/>
												</Avatar>

												<div className={`p-3 max-w-[70%] ${bubbleClass}`}>
													{/* Text message */}
													{message.type === "text" && (
														<p className='text-sm'>{message.content}</p>
													)}

													{/* Song message */}
													{message.type === "song" && message.song && (
														<div
															onClick={() => navigate(`/songs/${message.song!.songId}`)}
															className='flex items-center gap-3 cursor-pointer hover:bg-red-900 rounded-md p-2 transition'
														>
															<img
															src={message.song.thumbnailUrl || "/default-song.jpg"}
															alt={message.song.title}
															className='w-12 h-12 rounded-md object-cover'
															/>
															<div className='flex-1'>
															<p className='text-sm font-semibold'>{message.song.title}</p>
															<p className='text-xs text-zinc-300'>{message.song.artist}</p>
															</div>
															<Play className='w-4 h-4 text-zinc-300' />
														</div>
													)}

													<span className='text-xs text-zinc-300 mt-1 block'>
														{formatTime(message.createdAt)}
													</span>
												</div>
											</div>
										);
									})}
									{/* Dòng này giúp tự scroll xuống khi có tin nhắn mới */}
									<div ref={bottomRef} />
								</div>
							</ScrollArea>

							<MessageInput />
						</>
					) : (
						<NoConversationPlaceholder />
					)}
				</div>
			</div>
		</main>
	);
};

export default ChatPage;

const NoConversationPlaceholder = () => (
	<div className='flex flex-col items-center justify-center h-full space-y-6'>
		<img src='/logo.png' alt='Logo' className='size-16 animate-bounce' />
		<div className='text-center'>
			<h3 className='text-zinc-300 text-lg font-medium mb-1'>No conversation selected</h3>
			<p className='text-zinc-500 text-sm'>Choose a friend to start chatting</p>
		</div>
	</div>
);
