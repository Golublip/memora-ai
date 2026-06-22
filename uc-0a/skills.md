skills:
  - name: classify_complaint
    description: Classifies a single complaint's text into category, priority, reason, and flag using rule-based parsing.
    input: A dictionary representing a row from the input CSV, containing at least the key "description".
    output: A dictionary with keys: complaint_id, category, priority, reason, flag.
    error_handling: If description is missing or null, defaults category to "Other", priority to "Standard", flag to "NEEDS_REVIEW", and reason to "Missing complaint description".

  - name: batch_classify
    description: Reads complaints from an input CSV, processes each row via classify_complaint, and writes results to an output CSV.
    input: Absolute/relative path to the input CSV file, and path to the output CSV file.
    output: None (writes results to output CSV file).
    error_handling: Handles missing files, empty files, and malformed CSV rows by logging warnings and continuing to process other rows without crashing.
