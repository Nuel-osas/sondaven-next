import Link from "next/link";
import ExternalVideo from "@/components/ExternalVideo";

export default function Modal2de0e525eb() {
  return (
    <div modal-media={"video"} className={"modal media"}>
      <div className={"modal_c"}>
        <div className={"modal_video theme_on-color"}>
          <div className={"modal_video_close"}>
            <div modal-media-close={"video"} className={"modal-trigger"}>
              <a
                aria-label={"Close"}
                hover-btn-close={""}
                href={"#"}
                className={"btn-close w-inline-block"}
              >
                <div className={"h6 text-dark"}>{"["}</div>
                <div hover={"label"} className={"btn-close_label"}>
                  <div hover={"icon"} className={"btn-close_icon"}>
                    <div className={"h6 text-dark"}>{"x"}</div>
                  </div>
                  <div hover={"icon"} className={"btn-close_icon"}>
                    <div className={"h6 text-dark"}>{"x"}</div>
                  </div>
                </div>
                <div className={"h6 text-dark"}>{"]"}</div>
              </a>
            </div>
          </div>
          <video
            muted={true}
            loop={true}
            playsInline={true}
            hover={"img"}
            modal-media-video={"video"}
            className={"video mob_modal_video"}
          ></video>
        </div>
      </div>
    </div>
  );
}
