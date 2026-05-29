-- Up migration: PostgreSQL NOTIFY triggers for real-time syncing

CREATE OR REPLACE FUNCTION notify_metric_update()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'metric_update',
    json_build_object(
      'org_id',      NEW.org_id,
      'metric_type', NEW.metric_type,
      'value',       NEW.value,
      'recorded_at', NEW.recorded_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS metric_update_trigger ON financial_metrics;

CREATE TRIGGER metric_update_trigger
  AFTER INSERT OR UPDATE ON financial_metrics
  FOR EACH ROW EXECUTE FUNCTION notify_metric_update();
