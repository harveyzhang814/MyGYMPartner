-- AlterTable: Make training_group_id optional in exercise_records
ALTER TABLE "exercise_records" ALTER COLUMN "training_group_id" DROP NOT NULL;

