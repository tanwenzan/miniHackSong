package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/zeroable/miniHackSong/backend/internal/api"
	"github.com/zeroable/miniHackSong/backend/internal/database"
)

type App struct {
	Router     *mux.Router
	DB         *sql.DB
	Repo       *database.Repository
	Controller *api.Controller
}

func (app *App) Initialize() error {
	// 初始化Router
	app.Router = mux.NewRouter()

	// 数据库连接配置
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "password")
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbName := getEnv("DB_NAME", "minihacksong")

	// 连接MySQL数据库
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	var err error
	app.DB, err = sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("无法连接到数据库: %v", err)
	}

	// 测试数据库连接
	err = app.DB.Ping()
	if err != nil {
		return fmt.Errorf("数据库连接测试失败: %v", err)
	}

	// 初始化数据库
	err = database.InitDB(app.DB)
	if err != nil {
		return fmt.Errorf("数据库初始化失败: %v", err)
	}

	// 初始化数据库仓库
	app.Repo = database.NewRepository(app.DB)

	// 初始化API控制器
	app.Controller = api.NewController(app.Repo)

	// 初始化NFT路由
	api.SetupMuxNFTRoutes(app.Router)

	return nil
}

func (app *App) initializeRoutes() {
	// 健康检查
	app.Router.HandleFunc("/health", app.healthCheck).Methods("GET")

	// API路由
	apiRouter := app.Router.PathPrefix("/api").Subrouter()

	// 注册API控制器路由
	app.Controller.RegisterRoutes(apiRouter)

	// 保留原有的示例API
	apiRouter.HandleFunc("/data", app.getData).Methods("GET")

	// 静态文件服务
	fs := http.FileServer(http.Dir("./static"))
	app.Router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))
}

func (app *App) Run(addr string) {
	log.Printf("服务器启动在 %s", addr)
	log.Fatal(http.ListenAndServe(addr, app.Router))
}

func (app *App) healthCheck(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]bool{"ok": true})
}

func (app *App) getData(w http.ResponseWriter, r *http.Request) {
	// 示例数据
	data := map[string]interface{}{
		"message": "来自后端API的数据",
		"status":  "success",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func getEnv(key, fallback string) string {
	// 加载.env文件
	_ = godotenv.Load()

	value, exists := os.LookupEnv(key)
	if !exists {
		value = fallback
	}
	return value
}

func main() {
	app := &App{}

	err := app.Initialize()
	if err != nil {
		log.Fatalf("应用初始化失败: %v", err)
	}

	port := getEnv("PORT", "8080")
	app.Run(":" + port)
}
