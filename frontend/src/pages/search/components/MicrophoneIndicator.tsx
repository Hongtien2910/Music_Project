import { FaMicrophone } from "react-icons/fa";

const MicrophoneIndicator = () => {
  return (
    <div className="flex justify-center my-4">
      <div className="relative flex items-center justify-center w-16 h-16 bg-customRed rounded-full animate-pulse">
        <FaMicrophone className="text-white text-xl" />
        <span className="absolute w-full h-full animate-ping rounded-full bg-customRed opacity-75" />
      </div>
    </div>
  );
};

export default MicrophoneIndicator;
