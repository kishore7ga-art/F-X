-- Normalise every component_key to the {section_type}_{layout_descriptor}
-- convention (adding-section-variants.md §4).
--
-- The original ten keys were hyphenated, predating that convention. Mixing
-- `hero-centered` with `hero_academic_masthead` in one registry is exactly the
-- guessing hazard the convention exists to prevent, so all of them move at once
-- rather than only the hero pair.
--
-- Safe to re-run. Must be applied together with the matching change to
-- src/components/sections/registry.tsx — a key present in the database but not
-- the registry renders as "no component registered".

BEGIN;

UPDATE section_variants SET component_key = 'hero_centered'        WHERE component_key = 'hero-centered';
UPDATE section_variants SET component_key = 'hero_split_image'     WHERE component_key = 'hero-image-split';
UPDATE section_variants SET component_key = 'about_two_column'     WHERE component_key = 'about-two-column';
UPDATE section_variants SET component_key = 'about_stacked_cards'  WHERE component_key = 'about-stacked';
UPDATE section_variants SET component_key = 'courses_card_grid'    WHERE component_key = 'courses-grid';
UPDATE section_variants SET component_key = 'courses_table'        WHERE component_key = 'courses-table';
UPDATE section_variants SET component_key = 'faculty_photo_cards'  WHERE component_key = 'faculty-cards';
UPDATE section_variants SET component_key = 'faculty_roster_list'  WHERE component_key = 'faculty-roster';
UPDATE section_variants SET component_key = 'contact_map_split'    WHERE component_key = 'contact-split';
UPDATE section_variants SET component_key = 'contact_centered'     WHERE component_key = 'contact-centered';

COMMIT;

-- Verify: expect zero hyphenated keys remaining.
SELECT s.section_type, sv.variant_name, sv.component_key
FROM section_variants sv
JOIN sections s ON s.id = sv.section_id
ORDER BY s.section_type, sv.component_key;

SELECT count(*) AS hyphenated_keys_remaining
FROM section_variants
WHERE component_key LIKE '%-%';
