"use client";
import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button, Select, MenuItem, Grid, Tooltip } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FontSize from "@/app/extensions/FontSize";
import ListIcon from "@mui/icons-material/List";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import TextAlign from "@tiptap/extension-text-align";
import { useTheme } from "./ThemeProvider";
import Placeholder from "@tiptap/extension-placeholder";

type Props = {
  contentCallBack: (newContent: string) => void;
  original_content: string;
  placeholder_text?: string;
};

const Tiptap = ({
  contentCallBack,
  original_content,
  placeholder_text,
}: Props) => {
  const { theme } = useTheme();
  const [currentFontSize, setCurrentFontSize] = useState<string>("16px"); // Default font size
  const [currentFontFamily, setCurrentFontFamily] =
    useState<string>("Roboto, sans-serif"); // Default font family
  const [content, setContent] = useState(original_content);

  // Gets rid of empty tags
  const cleanHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;

    const removeEmptyTags = (element: HTMLElement) => {
      element.querySelectorAll("*").forEach((child) => {
        if (
          child.tagName.toLowerCase() !== "img" &&
          !child.textContent?.trim() &&
          !child.children.length
        ) {
          child.remove();
        }
      });
    };
    removeEmptyTags(div);

    return div.innerHTML;
  };

  // Editor settings
  const editor = useEditor({
    content: original_content,
    extensions: [
      StarterKit,

      TextStyle,
      Color,
      FontFamily,
      Placeholder.configure({
        placeholder: placeholder_text,
      }),
      FontSize.configure({ defaultSize: "16px" }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      let foundFontSize = "16px";
      editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type.name === "fontSize" && mark.attrs.size) {
              foundFontSize = mark.attrs.size;
            }
          });
        }
      });
      const html = editor.getHTML();
      const cleanedHTML = cleanHtml(html);

      contentCallBack(cleanedHTML);
      setCurrentFontSize(foundFontSize);
    },
  });

  if (!editor) {
    return null;
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    contentCallBack(e.target.value);
  };

  // Handles changes to font size
  const changeFontSize = (size: string) => {
    editor.chain().focus().setFontSize(size).run();
    setCurrentFontSize(size);
  };

  // Handles Changes to font color
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    editor.chain().focus().setColor(color).run();
  };

  // Handles changes to font family
  const handleFontFamilyChange = (fontFamily: string) => {
    editor.chain().focus().setFontFamily(fontFamily).run();
    setCurrentFontFamily(fontFamily);
  };

  return (
    <Grid
      id={"editor_container"}
      // sx={{
      //   border:
      //     theme === "dark"
      //       ? "1px solid rgba(0, 0, 0, 0.7)"
      //       : "1px solid rgba(0, 0, 0, 0.23)",
      // }}
    >
      <Grid id="editor_toolbar">
        <Select
          id="editor_font_size"
          value={currentFontSize}
          onChange={(e) => changeFontSize(e.target.value as string)}
          displayEmpty
          sx={{
            height: 30,
            color: "inherit",
            overflow: "hidden",
            borderRadius: 0,
          }}
          inputProps={{ "aria-label": "Font Size" }}
        >
          <MenuItem value="8px">8</MenuItem>
          <MenuItem value="9px">9</MenuItem>
          <MenuItem value="10px">10</MenuItem>
          <MenuItem value="11px">11</MenuItem>
          <MenuItem value="12px">12</MenuItem>
          <MenuItem value="14px">14</MenuItem>
          <MenuItem value="16px">16</MenuItem>
          <MenuItem value="18px">18</MenuItem>
          <MenuItem value="20px">20</MenuItem>
          <MenuItem value="22px">22</MenuItem>
          <MenuItem value="24px">24</MenuItem>
          <MenuItem value="26px">26</MenuItem>
          <MenuItem value="28px">28</MenuItem>
        </Select>
        <Select
          value={currentFontFamily}
          id="editor_font_family"
          onChange={(e) => handleFontFamilyChange(e.target.value as string)}
          inputProps={{ "aria-label": "Font Family" }}
          sx={{
            height: 30,
            color: "inherit",
            overflow: "hidden",
            borderRadius: 0,
          }}
          size="small"
        >
          <MenuItem value="Arial">Arial</MenuItem>
          <MenuItem value="Courier New">Courier New</MenuItem>
          <MenuItem value="Georgia">Georgia</MenuItem>
          <MenuItem value="Times New Roman">Times New Roman</MenuItem>
          <MenuItem value="Verdana">Verdana</MenuItem>
          <MenuItem value="Tahoma">Tahoma</MenuItem>
          <MenuItem value="Trebuchet MS">Trebuchet MS</MenuItem>
          <MenuItem value="Lucida Console">Lucida Console</MenuItem>
          <MenuItem value="Comic Sans MS">Comic Sans MS</MenuItem>
          <MenuItem value="Impact">Impact</MenuItem>
          <MenuItem value="Helvetica">Helvetica</MenuItem>
          <MenuItem value="Roboto, sans-serif">Roboto</MenuItem>
        </Select>
        <Grid id="editor_text_color_box">
          <input
            type="color"
            onChange={handleColorChange}
            value={editor.getAttributes("textStyle").color || "black"}
            data-testid="setColor"
            placeholder="fdsfsd"
          />
          <FormatColorTextIcon />
        </Grid>
        <Tooltip title="Bold">
          <Button
            id="editor_bold_btn"
            className="editor_buttons"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <FormatBoldIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Italic">
          <Button
            id="editor_italic_btn"
            className="editor_buttons"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <FormatItalicIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Bullet List">
          <Button
            id="editor_bullet_list_btn"
            className="editor_buttons"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Align Left">
          <Button
            id="editor_align_left_btn"
            className="editor_buttons"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <FormatAlignLeftIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Align Center">
          <Button
            id="editor_align_center_btn"
            className="editor_buttons"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <FormatAlignCenterIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Align Right">
          <Button
            id="editor_align_right_btn"
            className="editor_buttons"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <FormatAlignRightIcon />
          </Button>
        </Tooltip>
      </Grid>
      <EditorContent
        editor={editor}
        id="editor_text_box"
        onChange={handleContentChange}
      />
    </Grid>
  );
};

export default Tiptap;
