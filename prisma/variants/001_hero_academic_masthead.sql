-- Register the "Academic Masthead" hero variant.
--
-- Source: https://github.com/dmsl/academic-responsive-template (CC BY 4.0)
-- Layout rebuilt in Tailwind; no Bootstrap markup or CSS was copied.
--
-- Registers the variant for the HERO section of every template that has one,
-- so it works whichever template a college is on.

INSERT INTO section_variants (id, section_id, variant_name, component_key)
SELECT
    gen_random_uuid()::text,
    s.id,
    'Academic Masthead',
    'hero_academic_masthead'
FROM sections s
WHERE s.section_type = 'HERO'
ON CONFLICT (section_id, component_key) DO NOTHING;

-- Verify
SELECT t.name AS template, sv.variant_name, sv.component_key
FROM section_variants sv
JOIN sections s ON s.id = sv.section_id
JOIN templates t ON t.id = s.template_id
WHERE s.section_type = 'HERO'
ORDER BY sv.variant_name;
