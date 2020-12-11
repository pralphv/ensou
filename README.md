## Lessons learnt
- Don't use redux when performance is critical
  - useSelector affect not so much but still should be prevented
  - dispatch absolutely not good
  
- Speed:
  - CSS < Inline style < MUI useClass

- Avoid variable assignment to prevent garbage collection
