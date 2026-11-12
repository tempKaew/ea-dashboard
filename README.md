# EA Dashboard

แดชบอร์ดดูบัญชีและผลเทรดแบบเรียลไทม์ โปรเจกต์นี้ใช้เดี่ยวไม่ได้ ต้องรันคู่กับ [mt4-receiver](https://github.com/tempKaew/mt4-receiver)

ข้อมูลไม่ได้ถูกส่งจาก MetaTrader เข้า dashboard โดยตรง EA ส่งเข้า `mt4-receiver` ก่อน แล้ว `mt4-receiver` ส่งต่อเข้า dashboard

```
SendDataToApi  →  mt4-receiver  →  ea-dashboard
   (MT4/MT5)         (รับ POST)        (แสดงผล)
```

## โปรเจกต์ที่ต้องใช้ร่วมกัน

| บทบาท | ที่อยู่ |
|---|---|
| แดชบอร์ด | [ea-dashboard](https://github.com/tempKaew/ea-dashboard) |
| ตัวรับข้อมูล | [mt4-receiver](https://github.com/tempKaew/mt4-receiver) |
| EA ที่ส่งข้อมูล | [SendDataToApi](https://github.com/tempKaew/develop-forex-ea) ในโฟลเดอร์ `SendDataToApi` |

EA มีทั้ง `SendDataToAPI.mq4` และ `SendDataToAPI.mq5` ค่า `API_URL` เริ่มต้นคือ `http://localhost/mt4` ซึ่งเป็น endpoint ของ `mt4-receiver`

ใน MetaTrader ต้องอนุญาต URL นี้ที่ Tools → Options → Expert Advisors → Allow WebRequest

## ลำดับการทำงาน

1. เปิด `mt4-receiver` ให้รับ `POST /mt4`
2. เปิด `ea-dashboard` เพื่ออ่านข้อมูลที่ receiver ส่งมา
3. ใส่ EA `SendDataToApi` บนชาร์ต แล้วให้มันส่งสถานะบัญชีเข้า `mt4-receiver`

## รัน dashboard

```bash
npm install
npm run dev
```

เปิดที่ http://localhost:3000

รันทั้งชุดด้วย Docker:

```bash
docker compose up -d --build
```

แอป production อยู่ที่ http://localhost:3001
