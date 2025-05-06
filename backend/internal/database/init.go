package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

// InitDB 初始化数据库，执行schema.sql中的SQL语句
func InitDB(db *sql.DB) error {
	// 获取当前目录下的schema.sql文件
	schemaPath := filepath.Join("internal", "database", "schema.sql")
	log.Printf("尝试加载数据库模式文件: %s", schemaPath)

	// 读取SQL文件内容
	sqlBytes, err := os.ReadFile(schemaPath)
	if err != nil {
		// 如果找不到文件，尝试相对于工作目录的路径
		alternativePath := filepath.Join("backend", "internal", "database", "schema.sql")
		log.Printf("尝试替代路径: %s", alternativePath)
		sqlBytes, err = os.ReadFile(alternativePath)
		if err != nil {
			return fmt.Errorf("无法读取数据库模式文件: %v", err)
		}
	}

	// 将SQL文件内容转换为字符串
	sqlContent := string(sqlBytes)

	// 按分号分割SQL语句
	sqlStatements := strings.Split(sqlContent, ";")

	// 执行每条SQL语句
	for _, statement := range sqlStatements {
		// 去除空白字符
		statement = strings.TrimSpace(statement)
		if statement == "" {
			continue
		}

		// 执行SQL语句
		_, err := db.Exec(statement)
		if err != nil {
			// 忽略"数据库已存在"的错误
			if strings.Contains(err.Error(), "database exists") {
				log.Printf("数据库已存在，继续执行其他语句")
				continue
			}
			return fmt.Errorf("执行SQL语句失败: %v, 语句: %s", err, statement)
		}
	}

	log.Println("数据库初始化成功")
	return nil
}
