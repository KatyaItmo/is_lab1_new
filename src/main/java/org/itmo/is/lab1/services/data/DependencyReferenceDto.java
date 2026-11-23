package org.itmo.is.lab1.services.data;

public class DependencyReferenceDto {
    private EntityType entityType;
    private Integer entityId;
    private Integer replacementId;

    public DependencyReferenceDto() {}

    public DependencyReferenceDto(EntityType entityType, Integer entityId) {
        this.entityType = entityType;
        this.entityId = entityId;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }

    public Integer getEntityId() {
        return entityId;
    }

    public void setEntityId(Integer entityId) {
        this.entityId = entityId;
    }

    public Integer getReplacementId() {
        return replacementId;
    }

    public void setReplacementId(Integer replacementId) {
        this.replacementId = replacementId;
    }
}
