-- CreateTable: training_plan_exercises
CREATE TABLE "training_plan_exercises" (
    "id" TEXT NOT NULL,
    "training_plan_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "training_group_id" TEXT,
    "order_index" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_plan_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable: training_plan_exercise_sets
CREATE TABLE "training_plan_exercise_sets" (
    "id" TEXT NOT NULL,
    "training_plan_exercise_id" TEXT NOT NULL,
    "set_number" INTEGER NOT NULL,
    "reps" INTEGER,
    "weight" DECIMAL(8,2),
    "rest_time_seconds" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_plan_exercise_sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_plan_exercises_training_plan_id_order_index_key" ON "training_plan_exercises"("training_plan_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "training_plan_exercise_sets_training_plan_exercise_id_set_number_key" ON "training_plan_exercise_sets"("training_plan_exercise_id", "set_number");

-- AddForeignKey
ALTER TABLE "training_plan_exercises" ADD CONSTRAINT "training_plan_exercises_training_plan_id_fkey" FOREIGN KEY ("training_plan_id") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plan_exercises" ADD CONSTRAINT "training_plan_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plan_exercises" ADD CONSTRAINT "training_plan_exercises_training_group_id_fkey" FOREIGN KEY ("training_group_id") REFERENCES "training_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plan_exercise_sets" ADD CONSTRAINT "training_plan_exercise_sets_training_plan_exercise_id_fkey" FOREIGN KEY ("training_plan_exercise_id") REFERENCES "training_plan_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropTable (after creating new tables and migrating data if needed)
DROP TABLE IF EXISTS "training_plan_groups";

