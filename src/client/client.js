class Client {
  async getResponse(url, opts) {
    opts = opts || {};
    opts.headers = opts.headers || {};
    if (!opts.body && opts.jsonBody) {
      opts.body = JSON.stringify(opts.jsonBody);
      opts.headers["Content-Type"] = "application/json";
    }
    var response = await fetch(url, opts);
    if (response.status != 200) {
      var err = new Error(response.statusText);
      err.code = response.status;
      err.message = await response.text();
      throw err;
    }
    return response;
  }
  async getText(url, opts) {
    var res = await this.getResponse(url, opts);
    return await res.text();
  }
  async getJson(url, opts) {
    var data = await this.getText(url, opts);
    try {
      data = JSON.parse(data);
    } catch (e) {
      throw new Error("Response was not valid JSON");
    }
    return data;
  }
  async execute(url, opts) {
    await this.getResponse(url, opts);
  }

  async createPin(data) {
    return await this.getText("/api/pins", {
      method: "POST",
      jsonBody: data,
    });
  }
  async getPins() {
    return await this.getJson("/api/pins", { method: "GET" });
  }
  async updatePin(id, data) {
    return await this.execute("/api/pins/" + id, {
      method: "PATCH",
      jsonBody: data,
    });
  }
  async deletePin(id) {
    return await this.execute("/api/pins/" + id, { method: "DELETE" });
  }
  async login(pin, cb) {
    var pin = await this.getJson("/api/pins/login", {
      method: "POST",
      jsonBody: { pin: pin },
    });
    return pin;
  }
}

module.exports = new Client();
