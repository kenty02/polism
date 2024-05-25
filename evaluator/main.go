package main

import (
	"github.com/joho/godotenv"
	"github.com/open-policy-agent/opa/rego"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	supa "github.com/nedpals/supabase-go"
)

type policy struct {
	CreatedAt   time.Time `json:"created_at"`
	Description string    `json:"description"`
	Id          int       `json:"id"`
	Name        string    `json:"name"`
	RegoCode    string    `json:"rego_code"`
}

type evaluateRequest struct {
	Input map[string]interface{} `json:"input"`
	Query string                 `json:"query"`
}

func main() {

	_ = godotenv.Load(".env.development", ".env.local")
	e := echo.New()
	e.Debug = true
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})
	apiUrl := os.Getenv("SUPABASE_URL")
	apiKey := os.Getenv("SUPABASE_SERVICE_KEY")
	supabase := supa.CreateClient(apiUrl, apiKey, true)
	//TODO auth
	e.POST("/evaluate/:org_id", func(c echo.Context) error {
		orgId := c.Param("org_id")

		var body evaluateRequest
		err := c.Bind(&body)
		if err != nil {
			return err
		}

		var opResults []struct {
			PolicyId int `json:"policy_id"`
		}
		err = supabase.DB.From("organization_policies").Select("policy_id").Eq("organization_id", orgId).ExecuteWithContext(c.Request().Context(), &opResults)
		if err != nil {
			return err
		}
		var policyIds []string
		for _, result := range opResults {
			policyIds = append(policyIds, strconv.Itoa(result.PolicyId))
		}
		var policies []policy
		err = supabase.DB.From("policies").Select("*").In("id", policyIds).ExecuteWithContext(c.Request().Context(), &policies)
		if err != nil {
			return err
		} else if len(policies) == 0 {
			return c.JSON(http.StatusNotFound, "found 0 policies for org")
		} else if len(policies) != len(policyIds) {
			return c.JSON(http.StatusNotFound, "mismatched policies")
		}
		var modules []func(*rego.Rego)
		for _, policy := range policies {
			modules = append(modules,
				rego.Module(strconv.Itoa(policy.Id)+".rego", policy.RegoCode),
				rego.Input(body.Input),
			)
		}

		query, err := rego.New(
			append(modules, rego.Query(body.Query))...,
		).PrepareForEval(c.Request().Context())
		if err != nil {
			return err
		}
		results, err := query.Eval(c.Request().Context())
		if err != nil {
			return err
		} else if len(results) == 0 {
			return c.JSON(http.StatusNotFound, "query")
		}
		return c.JSON(http.StatusOK, results[0].Expressions[0].Value)
	})
	e.Logger.Fatal(e.Start(":1324"))
}
