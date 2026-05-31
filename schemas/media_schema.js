db.createCollection("media", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["title", "year", "type", "director"],
            properties: {
                title: { bsonType: "string", description: "Le titre est requis et doit être une chaîne" },
                year: { bsonType: "number", minimum: 1900, description: "L'année est requise (nombre)" },
                type: { enum: ["Movie", "Series"], description: "Doit être 'Movie' ou 'Series'" },
                genres: { bsonType: "array", items: { bsonType: "string" } },
                director: { bsonType: "string" },
                rating: { bsonType: "number", minimum: 0, maximum: 10 },
                cast: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            actor: { bsonType: "string" },
                            role: { bsonType: "string" }
                        }
                    }
                },
                awards: {
                    bsonType: "object",
                    properties: {
                        wins: { bsonType: "number" },
                        nominations: { bsonType: "number" }
                    }
                },
                duration_min: { bsonType: "number", description: "Durée en minutes" },
                seasons: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        properties: {
                            number: { bsonType: "number" },
                            episodes: { bsonType: "number" }
                        }
                    }
                },
                availability: {
                    bsonType: "object",
                    properties: {
                        netflix: { bsonType: "bool" },
                        prime: { bsonType: "bool" },
                        disney: { bsonType: "bool" }
                    }
                }
            }
        }
    }
});