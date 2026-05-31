db.createCollection("media", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["title", "year", "type", "director"],
            properties: {
                title: { bsonType: "string", description: "Le titre est requis et doit être une chaîne" },
                year: { bsonType: "int", minimum: 1900, description: "L'année est requise (entier)" },
                type: { enum: ["Movie", "Series"], description: "Doit être 'Movie' ou 'Series'" },
                genres: { bsonType: "array", items: { bsonType: "string" } },
                director: { bsonType: "string" },
                rating: { bsonType: ["double", "int"], minimum: 0, maximum: 10 },
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