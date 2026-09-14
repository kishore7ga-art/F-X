"use client";

import { useState } from "react";
import {
  Star,
  Heart,
  Check,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Phone,
  Mail,
  MapPin,
  Globe,
  User,
  Shield,
  Zap,
  Sparkles,
  Bell,
  Play,
  Search,
  ShoppingBag,
  Calendar,
  Clock,
  Plus,
  ExternalLink,
  Award,
  Coffee,
  Camera,
  Music,
  Video,
  MessageCircle,
  ThumbsUp,
  Send,
  Share2,
  HelpCircle,
  Info,
  Settings,
  Trash2,
  Edit,
  CheckCircle,
  Bookmark,
  Download,
  Upload,
  Eye,
  Lock,
  Layers,
  Link as LinkIcon,
} from "lucide-react";

import type { IconProps } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { ColorField, Divider, Field, PxField, Segmented, TextField } from "./fields";

export const PRESET_ICONS = [
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
  { name: "Check", icon: Check },
  { name: "CheckCircle", icon: CheckCircle },
  { name: "ArrowRight", icon: ArrowRight },
  { name: "ArrowLeft", icon: ArrowLeft },
  { name: "ArrowUp", icon: ArrowUp },
  { name: "ArrowDown", icon: ArrowDown },
  { name: "Phone", icon: Phone },
  { name: "Mail", icon: Mail },
  { name: "MapPin", icon: MapPin },
  { name: "Globe", icon: Globe },
  { name: "User", icon: User },
  { name: "Shield", icon: Shield },
  { name: "Zap", icon: Zap },
  { name: "Sparkles", icon: Sparkles },
  { name: "Bell", icon: Bell },
  { name: "Play", icon: Play },
  { name: "Search", icon: Search },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Calendar", icon: Calendar },
  { name: "Clock", icon: Clock },
  { name: "Plus", icon: Plus },
  { name: "ExternalLink", icon: ExternalLink },
  { name: "Award", icon: Award },
  { name: "Coffee", icon: Coffee },
  { name: "Camera", icon: Camera },
  { name: "Music", icon: Music },
  { name: "Video", icon: Video },
  { name: "MessageCircle", icon: MessageCircle },
  { name: "ThumbsUp", icon: ThumbsUp },
  { name: "Send", icon: Send },
  { name: "Share2", icon: Share2 },
  { name: "HelpCircle", icon: HelpCircle },
  { name: "Info", icon: Info },
  { name: "Settings", icon: Settings },
  { name: "Bookmark", icon: Bookmark },
  { name: "Download", icon: Download },
  { name: "Upload", icon: Upload },
  { name: "Eye", icon: Eye },
  { name: "Lock", icon: Lock },
  { name: "Layers", icon: Layers },
];

const STROKE_OPTIONS = [
  { value: "1", label: "1px" },
  { value: "1.5", label: "1.5px" },
  { value: "2", label: "2px" },
  { value: "2.5", label: "2.5px" },
  { value: "3", label: "3px" },
];

export interface ExtendedIconPanelProps extends PanelProps<IconProps> {
  onChangeIcon?: (iconName: string) => void;
}

export function IconPanel({ tab, props, onChange, onChangeIcon }: ExtendedIconPanelProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = PRESET_ICONS.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelectIcon = (iconName: string) => {
    onChange({ iconName });
    onChangeIcon?.(iconName);
    setIsPickerOpen(false);
  };

  if (tab === "icon") {
    return (
      <>
        {/* Quick Icon Selector / Modal Trigger */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-800 shadow-xs hover:border-indigo-400 transition cursor-pointer"
          >
            <span>Icon: {props.iconName || "Star"}</span>
          </button>

          {isPickerOpen && (
            <div
              className="absolute bottom-full mb-2 left-0 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Search icons…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto p-1">
                {filteredIcons.map(({ name, icon: IconComp }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelectIcon(name)}
                    title={name}
                    className={`flex items-center justify-center p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer ${
                      props.iconName === name ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white" : "text-slate-700"
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Divider />

        <ColorField label="Color" value={props.color || "#2563eb"} onChange={(color) => onChange({ color })} />
        <PxField label="Size" value={props.size || "24px"} min={12} max={120} onChange={(size) => onChange({ size })} />
        <Segmented label="Stroke" value={props.strokeWidth || "2"} options={STROKE_OPTIONS} onChange={(strokeWidth) => onChange({ strokeWidth })} />
      </>
    );
  }

  // style & link
  return (
    <>
      <Field label="Link URL">
        <div className="flex items-center gap-1">
          <LinkIcon className="h-3 w-3 text-slate-400" />
          <TextField value={props.href || ""} placeholder="https://… or #section" onCommit={(href) => onChange({ href })} width="w-[170px]" mono />
        </div>
      </Field>
      <Divider />
      <ColorField label="Background" value={props.background || "transparent"} allowEmpty onChange={(background) => onChange({ background })} />
      <PxField label="Radius" value={props.radius || "0px"} max={48} onChange={(radius) => onChange({ radius })} />
      <PxField label="Padding" value={props.padding || "0px"} max={48} onChange={(padding) => onChange({ padding })} />
    </>
  );
}
