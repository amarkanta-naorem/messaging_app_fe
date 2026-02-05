import { FormatTime } from "@/utils/FormatTime";

export default function AllConversation ({ data }: any) {
    return (
        <div className="divide-y">
          {data.map((conv: any) => (
            <div key={conv.id} className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-300 shrink-0 overflow-hidden">
                {conv.participant.avatar ? (
                  <img src={conv.participant.avatar} alt={conv.participant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 font-semibold">
                    {conv.participant.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate">{conv.participant.name}</span>
                  {conv.lastMessage && (
                    <span className="text-xs text-gray-500">{FormatTime(conv.lastMessage.createdAt)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage?.content.text || "No messages"}</p>
                  {conv.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
    );
}