package com.julian.webdziekanat_backend.exceptions;


import lombok.Getter;

@Getter
public class IllegalDeletionAttemptException extends Exception {
    public String entityName;
    public String relatedField;

    public IllegalDeletionAttemptException(String message, String entityName, String relatedField) {
        super(message);
        this.entityName = entityName;
        this.relatedField = relatedField;
    }
}
