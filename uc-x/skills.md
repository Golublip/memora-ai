skills:
  - name: retrieve_documents
    description: Loads the three policy text files and indexes their clauses by document name and section number.
    input: None (loads from a configured data directory).
    output: Dict of documents with parsed sections/clauses.
    error_handling: Logs errors and raises FileNotFoundError if any of the three policy files are missing.

  - name: answer_question
    description: Searches the indexed documents for keywords to answer the user's question, returning a single-source cited answer or the exact refusal template.
    input: Question string.
    output: Answer string with document and section citation, or refusal template.
    error_handling: Returns the exact refusal template if the query is ambiguous, missing, or not found in the source documents.
