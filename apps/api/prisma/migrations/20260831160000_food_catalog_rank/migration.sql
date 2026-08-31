ALTER TABLE "public"."FoodItem" ADD COLUMN "catalogRank" INTEGER NOT NULL DEFAULT 0;

UPDATE "public"."FoodItem"
SET "catalogRank" = CASE
  WHEN "name" IN ('米饭','面条','馒头','燕麦','红薯','玉米','鸡蛋','鸡胸肉','牛肉','猪里脊','虾仁','三文鱼','豆腐','豆浆','豆干','毛豆','西兰花','番茄','黄瓜','菠菜','生菜','胡萝卜','牛奶','无糖酸奶','奶酪','苹果','香蕉','橙子','猕猴桃','草莓','核桃','杏仁','花生') THEN 30
  WHEN "name" !~ '[A-Za-z0-9]' AND "name" !~ '[（）()]' AND "name" !~ '[[:space:]]' THEN 20
  WHEN "name" !~ '[[:space:]]' THEN 10
  ELSE 0
END;

CREATE INDEX "FoodItem_categoryId_catalogRank_name_idx" ON "public"."FoodItem"("categoryId", "catalogRank", "name");
