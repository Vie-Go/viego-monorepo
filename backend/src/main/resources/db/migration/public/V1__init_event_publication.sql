-- Spring Modulith Event Publication Registry Table
-- Schema: public

CREATE TABLE IF NOT EXISTS public.event_publication (
    id UUID NOT NULL,
    listener_id VARCHAR(512) NOT NULL,
    event_type VARCHAR(512) NOT NULL,
    serialized_event VARCHAR(4000) NOT NULL,
    publication_date TIMESTAMPTZ NOT NULL,
    completion_date TIMESTAMPTZ,
    completion_attempts INT NOT NULL DEFAULT 0,
    last_resubmission_date TIMESTAMPTZ,
    status VARCHAR(32),
    PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_event_publication_by_completion ON public.event_publication(completion_date);
