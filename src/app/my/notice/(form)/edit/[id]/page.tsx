"use client";

import FormWrapper from "@/app/blog/_components/FormWrapper";
import { useNoticeDetail } from "@/app/hooks/my/useMy";
import { useParams } from "next/navigation";

const NoticeEdit = () => {
  const params = useParams();
  const noticeId = params.id as string;
  const data = useNoticeDetail(noticeId);

  if (!data) return null;

  return (
    <FormWrapper
      title="공지 수정"
      editMode
      name="notice"
      defaultData={data}
      id={noticeId}
    />
  );
};

export default NoticeEdit;
