#### 설명

과제 테스트를 진행한 프로젝트 레포로써 현재는 각 브랜치별로 분리하여 학습 레포로 사용하고있습니다.

```

next-test-blog : main 브랜치의 express와 ec2 서버를 종료하고 next.js로만 활용해보는 학습 브랜치

main : supabase에서 express, mongodb로 전환 및 활용해보는 학습 브랜치 (종료)

supabase-test-blog : 과제 테스트 서버가 중단되어 대체로 supabase를 활용해보는 학습 브랜치

submit-test-blog : 과제 테스트를 진행한 브랜치
```

---

- 기존 main 브랜치에서 express로 처리하던 API/DB 호출을 Server Action으로 전환하여 처리
- Next-Auth를 활용하여 사용자 인증과 세션 관리 설정
- mongodb 연동 및 스키마 정의
- presigned url로 이미지 업로드를 위한 aws s3 bucket 설정
- 현재 ec2 서버 종료로 main 브랜치가 아닌 next-test-blog로 재배포

---

#### 사용한 기술 스택 및 라이브러리

next.js, tanstack-query, typescript, tailwindcss, shadcn ui, react-hook-form, zod, jest, react testing library, mongodb
