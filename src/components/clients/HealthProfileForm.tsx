"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Flame, Plus, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { TagInput } from "@/components/ui/TagInput";
import { Button } from "@/components/ui/Button";
import { addBodyCompositionReading, getHealthProfile, saveHealthProfile } from "@/lib/clients/api";
import type { ActivityLevel, Gender, Medication } from "@/lib/clients/types";

const ACTIVITY_LEVELS: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];

const ACTIVITY_LABEL_KEYS: Record<ActivityLevel, string> = {
  sedentary: "activitySedentary",
  light: "activityLight",
  moderate: "activityModerate",
  active: "activityActive",
  very_active: "activityVeryActive",
};

const EMPTY_MEDICATION: Medication = { name: "", dose: "", schedule: "" };

export function HealthProfileForm({ subscriberId }: { subscriberId: string }) {
  const t = useTranslations("clients.healthProfile");
  const { authorizedFetch } = useAuth();

  const [loaded, setLoaded] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("sedentary");
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [surgeryHistory, setSurgeryHistory] = useState("");
  const [labNotes, setLabNotes] = useState("");
  const [nutritionistNotes, setNutritionistNotes] = useState("");

  const [bodyFatPercent, setBodyFatPercent] = useState("");
  const [muscleMassKg, setMuscleMassKg] = useState("");
  const [waterPercent, setWaterPercent] = useState("");
  const [waistCm, setWaistCm] = useState("");

  const [dailyCalorieNeeds, setDailyCalorieNeeds] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getHealthProfile(authorizedFetch, subscriberId).then((result) => {
      if (cancelled || !result.ok || !result.data) {
        setLoaded(true);
        return;
      }

      const profile = result.data;
      setWeight(String(profile.weight_kg));
      setHeight(String(profile.height_cm));
      setAge(String(profile.age));
      setGender(profile.gender);
      setActivityLevel(profile.activity_level);
      setHealthConditions(profile.health_conditions);
      setMedications(profile.medications.length > 0 ? profile.medications : []);
      setAllergies(profile.allergies);
      setFoodPreferences(profile.food_preferences);
      setSurgeryHistory(profile.surgery_history ?? "");
      setLabNotes(profile.lab_notes ?? "");
      setNutritionistNotes(profile.nutritionist_notes ?? "");
      setDailyCalorieNeeds(profile.daily_calorie_needs);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, subscriberId]);

  function updateMedication(index: number, field: keyof Medication, value: string) {
    setMedications((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function removeMedication(index: number) {
    setMedications((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSavedMessage(null);
    setSubmitting(true);

    const profileResult = await saveHealthProfile(authorizedFetch, subscriberId, {
      weight_kg: Number(weight),
      height_cm: Number(height),
      age: Number(age),
      gender,
      activity_level: activityLevel,
      health_conditions: healthConditions,
      medications: medications.filter((m) => m.name.trim() !== ""),
      allergies,
      food_preferences: foodPreferences,
      surgery_history: surgeryHistory || null,
      lab_notes: labNotes || null,
      nutritionist_notes: nutritionistNotes || null,
    });

    if (!profileResult.ok) {
      setFormError(profileResult.error.message);
      setSubmitting(false);
      return;
    }

    // Body-composition fields are bundled into this same form (S2-12) but
    // belong to a separate history endpoint (FR-10: one row per visit,
    // never overwritten) — only log a reading if something was entered.
    const hasCompositionData = [bodyFatPercent, muscleMassKg, waterPercent, waistCm].some((v) => v !== "");

    if (hasCompositionData) {
      await addBodyCompositionReading(authorizedFetch, subscriberId, {
        recorded_at: new Date().toISOString().slice(0, 10),
        weight_kg: Number(weight),
        body_fat_percent: bodyFatPercent ? Number(bodyFatPercent) : null,
        muscle_mass_kg: muscleMassKg ? Number(muscleMassKg) : null,
        water_percent: waterPercent ? Number(waterPercent) : null,
        waist_cm: waistCm ? Number(waistCm) : null,
      });
    }

    setDailyCalorieNeeds(profileResult.data.daily_calorie_needs);
    setSavedMessage(t("saved"));
    setSubmitting(false);
  }

  if (!loaded) {
    return <div className="py-16 text-center text-sm text-ink-muted">…</div>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-ink">{t("sectionBody")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label={t("weight")}
            type="number"
            step="0.1"
            min="1"
            max="500"
            required
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <TextField
            label={t("height")}
            type="number"
            step="0.1"
            min="30"
            max="272"
            required
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <TextField
            label={t("age")}
            type="number"
            min="1"
            max="120"
            required
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <Select label={t("gender")} value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
            <option value="female">{t("genderFemale")}</option>
            <option value="male">{t("genderMale")}</option>
          </Select>
          <div className="col-span-2">
            <Select
              label={t("activityLevel")}
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {t(ACTIVITY_LABEL_KEYS[level])}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {dailyCalorieNeeds !== null && (
          <div className="flex items-center gap-3 rounded-control border border-primary/15 bg-primary/5 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary">
              <Flame size={18} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs text-ink-muted">{t("dailyCalorieNeeds")}</p>
              <p className="text-lg font-semibold text-primary">{t("kcalPerDay", { value: dailyCalorieNeeds })}</p>
            </div>
          </div>
        )}
      </section>

      <section className="border-t border-divider pt-6">
        <TagInput
          label={t("sectionConditions")}
          value={healthConditions}
          onChange={setHealthConditions}
          hint={t("conditionsHint")}
          placeholder={t("tagPlaceholder")}
          addLabel={t("addTag")}
          removeLabel={(v) => t("removeTag", { value: v })}
        />
      </section>

      <section className="flex flex-col gap-3 border-t border-divider pt-6">
        <h2 className="text-sm font-semibold text-ink">{t("sectionMedications")}</h2>

        {/*
          A 4-column grid (name/dose/schedule/remove) clips the name field
          at mobile widths — 3 equal text columns plus a remove button
          leave ~90px per field at 390px, and the browser silently
          scrolls a too-narrow input to the caret position, showing only
          the END of whatever was typed (e.g. "Levothyroxine" renders as
          "vothyroxine"). A stacked layout — name gets the full row, dose
          and schedule share the row below — has room at every width
          instead of only above some breakpoint.
        */}
        {medications.map((medication, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-control border border-border p-3 transition-colors hover:border-ink-muted/30"
          >
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <TextField
                  label={t("medicationName")}
                  value={medication.name}
                  onChange={(e) => updateMedication(index, "name", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeMedication(index)}
                aria-label={t("removeMedication")}
                className="mb-0.5 flex h-[42px] w-10 shrink-0 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-status-late-bg hover:text-danger"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TextField
                label={t("medicationDose")}
                value={medication.dose ?? ""}
                onChange={(e) => updateMedication(index, "dose", e.target.value)}
              />
              <TextField
                label={t("medicationSchedule")}
                value={medication.schedule ?? ""}
                onChange={(e) => updateMedication(index, "schedule", e.target.value)}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          className="w-fit"
          onClick={() => setMedications((rows) => [...rows, { ...EMPTY_MEDICATION }])}
        >
          <Plus size={16} />
          {t("addMedication")}
        </Button>
      </section>

      <section className="border-t border-divider pt-6">
        <TagInput
          label={t("sectionAllergies")}
          value={allergies}
          onChange={setAllergies}
          hint={t("allergiesHint")}
          placeholder={t("tagPlaceholder")}
          addLabel={t("addTag")}
          removeLabel={(v) => t("removeTag", { value: v })}
        />
      </section>

      <section className="border-t border-divider pt-6">
        <TagInput
          label={t("sectionPreferences")}
          value={foodPreferences}
          onChange={setFoodPreferences}
          hint={t("preferencesHint")}
          placeholder={t("tagPlaceholder")}
          addLabel={t("addTag")}
          removeLabel={(v) => t("removeTag", { value: v })}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-card border border-dashed border-border p-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">{t("sectionComposition")}</h2>
          <p className="text-sm text-ink-muted">{t("compositionHint")}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label={t("bodyFatPercent")}
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={bodyFatPercent}
            onChange={(e) => setBodyFatPercent(e.target.value)}
          />
          <TextField
            label={t("muscleMassKg")}
            type="number"
            step="0.1"
            min="0"
            max="500"
            value={muscleMassKg}
            onChange={(e) => setMuscleMassKg(e.target.value)}
          />
          <TextField
            label={t("waterPercent")}
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={waterPercent}
            onChange={(e) => setWaterPercent(e.target.value)}
          />
          <TextField
            label={t("waistCm")}
            type="number"
            step="0.1"
            min="0"
            max="300"
            value={waistCm}
            onChange={(e) => setWaistCm(e.target.value)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-divider pt-6">
        <h2 className="text-sm font-semibold text-ink">{t("sectionNotes")}</h2>
        <TextArea label={t("surgeryHistory")} value={surgeryHistory} onChange={setSurgeryHistory} />
        <TextArea label={t("labNotes")} value={labNotes} onChange={setLabNotes} />
        <TextArea label={t("nutritionistNotes")} value={nutritionistNotes} onChange={setNutritionistNotes} />
      </section>

      {formError && (
        <p role="alert" className="rounded-control bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {formError}
        </p>
      )}

      {savedMessage && (
        <p role="status" className="rounded-control bg-status-on-track-bg px-3.5 py-2.5 text-sm text-status-on-track">
          {savedMessage}
        </p>
      )}

      <Button type="submit" isLoading={submitting} className="w-full">
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-control border border-border bg-card px-3.5 py-2.5 text-sm text-ink outline-none transition-all hover:border-ink-muted/40 focus:border-primary focus:ring-[3px] focus:ring-primary/15"
      />
    </div>
  );
}
