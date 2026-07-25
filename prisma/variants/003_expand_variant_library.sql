-- Expand the variant library to 6 designs per core section type, the target in
-- adding-section-variants.md §. Registers against every template that has the
-- matching section, so it is not Radian-specific.
--
-- Sources: layouts rebuilt from scratch in Tailwind against our own content
-- schema. The education repos surveyed (atulcodex/education-website,
-- rahul199939/university-website-template, snehavish595/college-website-template)
-- carry NO licence, so per §2 they were treated as visual inspiration only —
-- none of their markup or CSS was copied, and they require no attribution.
-- The one attributed design is hero_academic_masthead (CC BY 4.0), added in
-- 001_hero_academic_masthead.sql.
--
-- Safe to re-run. Must ship together with src/components/sections/registry.tsx.

BEGIN;

WITH new_variants(section_type, variant_name, component_key) AS (
    VALUES
        ('HERO',    'Minimal Text',      'hero_minimal_text'),
        ('HERO',    'Side Panel',        'hero_side_panel'),
        ('HERO',    'Stacked Banner',    'hero_stacked_banner'),

        ('ABOUT',   'Timeline',          'about_timeline'),
        ('ABOUT',   'Quote Lead',        'about_quote_lead'),
        ('ABOUT',   'Image Beside',      'about_image_beside'),
        ('ABOUT',   'Split Panel',       'about_split_panel'),

        ('COURSES', 'Accordion',         'courses_accordion'),
        ('COURSES', 'Numbered List',     'courses_numbered_list'),
        ('COURSES', 'Split Rows',        'courses_split_rows'),
        ('COURSES', 'Compact Tiles',     'courses_compact_tiles'),

        ('FACULTY', 'Circle Grid',       'faculty_circle_grid'),
        ('FACULTY', 'Department Groups', 'faculty_department_groups'),
        ('FACULTY', 'Overlay Tiles',     'faculty_overlay_tiles'),
        ('FACULTY', 'Minimal Table',     'faculty_minimal_table'),

        ('CONTACT', 'Form Only',         'contact_form_only'),
        ('CONTACT', 'Full Width Map',    'contact_full_width_map'),
        ('CONTACT', 'Cards Row',         'contact_cards_row'),
        ('CONTACT', 'Dark Panel',        'contact_dark_panel')
)
INSERT INTO section_variants (id, section_id, variant_name, component_key)
SELECT gen_random_uuid()::text, s.id, v.variant_name, v.component_key
FROM new_variants v
JOIN sections s ON s.section_type = v.section_type::"SectionType"
ON CONFLICT (section_id, component_key) DO NOTHING;

COMMIT;

-- Verify: expect 6 per core section type, and no hyphenated keys.
SELECT s.section_type, count(*) AS variants
FROM section_variants sv
JOIN sections s ON s.id = sv.section_id
GROUP BY s.section_type
ORDER BY s.section_type;

SELECT count(*) AS hyphenated_keys_remaining
FROM section_variants
WHERE component_key LIKE '%-%';
