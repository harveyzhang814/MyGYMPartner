-- AlterTable
ALTER TABLE "training_plans" DROP COLUMN "start_date",
DROP COLUMN "end_date",
ADD COLUMN "plan_date" DATE;

