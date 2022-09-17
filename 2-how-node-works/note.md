-- Single thread
Chạy "top-level" code (code ko trong 1 callback nào cả) -> require modules -> register event callbacks
-> start event loop
Những task nặng được tự động offload qua thread pool bởi nodejs để tránh block single thread
thread pool có 4 thread, có thể config đc thành 128

-- Event loop
Nơi mà những code trong callback được thực hiện
